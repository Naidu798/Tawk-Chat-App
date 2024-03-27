/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "lm-sidebar-background": "#F0F4FA",
        "lm-chat-bg": "#F8FAFF",
        "lm-white": "#FFF",
        "lm-blue": "#5B96F7",
        "lm-light-blue": "#709CE6",
        "lm-search-bg": "#EAF2FE",
        "pure-black": "#000",
        "incoming-background": "#FFF",
        "outgoing-background": "#5B96F7",
        "lm-messagebar-bg": "#EAF2FE",
        "logo-background": "#AFBBF7",
        "lm-gray": "#676667",
        "lm-gray-100": "#696969",
        "lm-gray-200": "#4B4B4B",
        "lm-gray-300": "#7C7C7D",
        "call-accept": "#35C677",
        "call-reject": "#FF4842",
        "call-icon-green": "#76D45E",
        "call-icon-red": "#FF4842",
        badge: "#76D45E",
      },
      fontFamily: {
        manrope: "Manrope",
      },
    },
  },
  plugins: [],
};
