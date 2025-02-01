const Code = document.getElementById("Code");
const Input = document.getElementById("Input");
const Output = document.getElementById("Output");
const Memory = document.getElementById("Memory");


const Rem = () => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
};

const AdjustTextareaHeight = (Primary, Second) => {
    Primary.style.height = "2rem";
    Primary.style.height = Primary.scrollHeight + "px";
}


Code.addEventListener("input", () => {
    AdjustTextareaHeight(Code, Input);
});


Input.addEventListener("input", () => {
    AdjustTextareaHeight(Input, Code);
});