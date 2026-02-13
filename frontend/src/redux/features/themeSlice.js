import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name: "theme", // akhana state ar name dawa hoyacha

    initialState: { // akhana initial state define kora hoyacha jamon react a useState("value") use kora hoy
        theme: localStorage.getItem("theme") || "light", // akhana localStorage theke theme value neya hoyacha abong sobar pothom "light" set kora hoyacha
    },

    reducers: { // akhana reducers define kora hoyacha mana akhana state change kora hoy function gular maddhome
        toggleTheme: (state) => { //state ar mana useState("light") er moto
            state.theme = state.theme === "light" ? "dark" : "light"; // useState("light") chelo ata akhana toggle kora hoycha
            localStorage.setItem("theme", state.theme);
        },
        //toggleTheme() ata call kora sudhu useState("light/dark") ar valu update hoba


        setThemeByColor: (state, action) => { 
            state.theme = action.payload;
            localStorage.setItem("theme", action.payload);
        },
    },
});

export const { toggleTheme, setThemeByColor } = themeSlice.actions;    
export default themeSlice.reducer;
