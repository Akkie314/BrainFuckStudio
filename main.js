class BrainFuck {
    constructor() {
        this.Memory = new Array(30000).fill(0);
        this.Pointer = 0;
        this.MaxPointer = 0;
        this.Output = "";
        this.MaxLoopCount = 3000; // 最大ループ回数

        this.AsciiMax = 127;

        this.Symbol = {
            ">" : ">",
            "<" : "<",
            "+" : "+",
            "-" : "-",
            "." : ".",
            "," : ",",
            "[" : "[",
            "]" : "]",

            "length" : 1,
        }
    }

    ChangeSymbol(Symbol, NewSymbol) {
        if (this.Symbol.hasOwnProperty(Symbol)) {
            this.Symbol[Symbol] = NewSymbol;

            this.Symbol.length = NewSymbol.length;
        } else {
            throw new Error(`Error : 指定されたシンボルが見つかりません。\n指定されたシンボル(${Symbol})は存在しません。`);
        }
    }

    ChangeAsciiMax(AsciiMax) {
        if (AsciiMax > 255) {
            throw new Error(`Error : ASCIIコードの範囲外です。\n指定されたASCIIコード(${AsciiMax})は範囲外です。範囲内(0 ~ 255)のASCIIコードを指定してください。`);
        }
        this.AsciiMax = AsciiMax;
    }

    interpreter = (Code, Inputs = "") => {
        this.Memory = new Array(30000).fill(0);
        this.Pointer = 0;
        this.MaxPointer = 0;
        this.Output = "";

        let LoopStack = [];
        let InputIndex = 0;
        let LoopCounts = new Map(); // ループ回数を記録するマップ

        // コードから不要な部分を削除
        const Symbols = Object.values(this.Symbol).join("");
        const Reg = new RegExp(`[^${Symbols}]`, "g");
        Code = Code.replace(Reg, "");

        try {
            for (let i = 0; i < Code.length; i+=this.Symbol.length) {
                let Chunk = Code.slice(i, i + this.Symbol.length);
                switch (Chunk) {
                    case this.Symbol[">"]:
                        this.Pointer++;
                        if (this.Pointer > this.MaxPointer) {
                            this.MaxPointer = this.Pointer;
                        }

                        if (this.Pointer > this.Memory.length) {
                            throw new Error(`Error : メモリ領域の範囲外にアクセスしようとしました。\n指定された${this.Pointer}番目のメモリアドレスが存在しません。範囲内(0 ~ ${this.Memory.length})のアドレスを指定してください。`);
                        }
                        break;
                    case this.Symbol["<"]:
                        this.Pointer--;
                        if (this.Pointer < 0) {
                            throw new Error(`Error : メモリ領域の範囲外にアクセスしようとしました。\n指定された${this.Pointer}番目のメモリアドレスが存在しません。範囲内(0 ~ ${this.Memory.length})のアドレスを指定してください。`);
                        }
                        break;
                    case this.Symbol["+"]:
                        this.Memory[this.Pointer]++;
                        if (this.Memory[this.Pointer] > 255) {
                            this.Memory[this.Pointer] = 0;
                        }
                        break;
                    case this.Symbol["-"]:
                        this.Memory[this.Pointer]--;
                        if (this.Memory[this.Pointer] < 0) {
                            this.Memory[this.Pointer] = 0;
                        }
                        break;
                    case this.Symbol["."]:
                        let OutputChar = String.fromCharCode(this.Memory[this.Pointer]);
                        if (OutputChar.charCodeAt(0) >= this.AsciiMax) {
                            OutputChar = "?";
                        }
                        this.Output += OutputChar;
                        break;
                    case this.Symbol[","]:
                        if (InputIndex >= Inputs.length) {
                            throw new Error(`Error : 入力が不足しています。\n指定された ${InputIndex+1}番目の入力が見つかりません。`);
                        }
                        this.Memory[this.Pointer] = Inputs[InputIndex].charCodeAt(0);
                        InputIndex++;
                        break;
                    case this.Symbol["["]:
                        LoopStack.push(i);
                        if (!LoopCounts.has(i)) {
                            LoopCounts.set(i, 0);
                        }
                        break;
                    case this.Symbol["]"]:
                        if (this.Memory[this.Pointer] === 0) {
                            LoopStack.pop();
                        } else {
                            let loopStart = LoopStack[LoopStack.length - 1];
                            LoopCounts.set(loopStart, LoopCounts.get(loopStart) + 1);
                            if (LoopCounts.get(loopStart) > this.MaxLoopCount) {
                                throw new Error(`Error : ループ回数が制限を超えました。\nループが上限(${this.MaxLoopCount} 回)を超えています。無限ループの可能性があるため、処理を中断しました。`);
                            }
                            i = loopStart;
                        }
                        break;
                    default:
                        break;
                }
            }
        } catch (e) {
            return e.message; // エラーが発生した場合にループを終了する
        }
    }

    ViewMemory = (Element) => {
        let Memory = this.Memory.slice(0, this.MaxPointer + 1);

        for (let i = 0; i < Memory.length; i++) {
            const Cell = document.createElement("div");
            Cell.classList.add("MemoryCell");
            if (i === this.Pointer) {
                Cell.classList.add("Pointer");
            }
            Cell.innerText = Memory[i];
            Element.appendChild(Cell);
        }
    }

    ViewOutput = (Element) => {
        Element.value = this.Output;
    }
}

const Element = {
    Code: document.getElementById("Code"),
    Input: document.getElementById("Input"),
    Checkbox: document.getElementById("AsciiMax"),
    Output: document.getElementById("Output"),
    Memory: document.getElementById("Memory"),
}

const BF = new BrainFuck();
BF.ViewMemory(Element.Memory);

const AutoInterpreter = () => {
    const error = BF.interpreter(Element.Code.value, Element.Input.value);
    
    Element.Memory.innerHTML = "";
    BF.ViewMemory(Element.Memory);
    BF.ViewOutput(Element.Output);

    if (error) {
        Element.Output.value = error;
    }
}
Element.Code.addEventListener("input", AutoInterpreter);

Element.Input.addEventListener("input", AutoInterpreter);

Element.Checkbox.addEventListener("change", () => {
    if (Element.Checkbox.checked) {
        BF.ChangeAsciiMax(127);
    } else {
        BF.ChangeAsciiMax(255);
    }

    AutoInterpreter();
})