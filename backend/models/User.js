import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Notun structure onujayi naam save kora hocche
    name: {
        firstName: { type: String, required: true },
        middleName: { type: String },
        lastName: { type: String, required: true }
    },
    phone: {
        type: String,
        // Bhabishshot-e ekhane validation add kora jete pare
    },
    dob: {
        type: Date, // Date of Birth
        // Age limit check korar jonno dorkar hobe
    },
    imageUrl: { // <--- এই ফিল্ডটি যোগ করা হলো
        type: String
    },
    role: {
        type: String,
        enum: ['attendee', 'organizer'],
        default: 'attendee'
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;