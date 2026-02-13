import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const organizerSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            firstName: { type: String, required: [true, 'First name is required.'] },
            lastName: { type: String, required: [true, 'Last name is required.'] },
        },
        password: {
            type: String,
            required: [true, 'Password is required.'],
            select: false, // By default, password query theke asbe na
        },
        role: {
            type: String,
            enum: ['organizer', 'admin'],
            default: 'organizer',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        imageUrl: {
            type: String,
        },
        profileImage: {
            type: String,
            default: ''
        },
        coverImage: {
            type: String,
            default: ''
        },
        phone: { type: String },
        bio: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String }
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        dob: { type: Date },
    },
    {
        timestamps: true,
    }
);

// --- Password Hashing Middleware ---
// Notun organizer toiri howar age ba password change hole, password-take automatically hash kora hobe
organizerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const Organizer = mongoose.model('Organizer', organizerSchema);

export default Organizer;
