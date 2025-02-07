// import React from "react";

const Button = ({ name }) => {
    return (
        <button
            type="submit"
            className="w-50 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition"
        >
            {name}
        </button>
    );
};

export default Button;