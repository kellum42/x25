export const getTheme = (style: "light" | "dark" ) => {
    return {
        "primary": "#00A3FF",
        "grey-500": style == "light" ? "#A1A5B7" : "#565674",
        "grey-200": style == "light" ? "#eff2f5" : "#2B2B40",
        "primary-light": style == "light" ? "#F1FAFF" : "#212E48"
    }
}