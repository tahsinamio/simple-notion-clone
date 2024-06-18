import { useState, useEffect, useRef } from "react";
import { Block, TextBlock, ImageBlock } from "../types";

const Home = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [newFormat, setNewFormat] = useState<"H1" | "H2" | "H3" | "paragraph">(
    "paragraph"
  );
  const [newImageSrc, setNewImageSrc] = useState<string>("");
  const [newImageWidth, setNewImageWidth] = useState<number>(100);
  const [newImageHeight, setNewImageHeight] = useState<number>(100);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [currentFormat, setCurrentFormat] = useState<"H1" | "H2" | "H3" | "paragraph">("paragraph");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [placeholder, setPlaceholder] = useState<string>("Type '/' for commands");
  const [content, setContent] = useState<string>("");
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const options = ["H1", "H2", "H3", "paragraph", "image"];

  useEffect(() => {
    fetch("/api/blocks")
      .then((res) => res.json())
      .then((data) => setBlocks(data));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "/") {
      setShowDropdown(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown) {
        handleOptionSelect(options[highlightedIndex]);
      } else if (selectedOption === "image") {
        addImageBlock();
      } else {
        addTextBlock(currentFormat);
      }
    } else if (e.key === "ArrowDown" && showDropdown) {
      setHighlightedIndex((prevIndex) => (prevIndex + 1) % options.length);
    } else if (e.key === "ArrowUp" && showDropdown) {
      setHighlightedIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
    setContent(contentEditableRef.current?.innerText || "");
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowDropdown(false);
    setHighlightedIndex(0); // Reset highlighted index
    if (option === "image") {
      setPlaceholder("Paste image URL and press Enter");
      setContent("");
      if (contentEditableRef.current) {
        contentEditableRef.current.innerText = "";
      }
    } else {
      // Change the input style
      setCurrentFormat(option as "H1" | "H2" | "H3" | "paragraph");
      if (contentEditableRef.current) {
        contentEditableRef.current.style.fontSize =
          option === "H1"
            ? "text-4xl"
            : option === "H2"
            ? "text-3xl"
            : option === "H3"
            ? "text-2xl"
            : "text-base";
        // Clear the content to remove the slash
        contentEditableRef.current.innerText = "";
      }
    }
  };

  const addTextBlock = async (format: string) => {
    const newBlock: TextBlock = {
      id: Date.now().toString(),
      type: "text",
      value: contentEditableRef.current?.innerText || "",
      format: format as "H1" | "H2" | "H3" | "paragraph",
    };
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock),
    });
    const data = await res.json();
    setBlocks([...blocks, data]);
    setContent("");
    if (contentEditableRef.current) {
      contentEditableRef.current.innerText = "";
      contentEditableRef.current.style.fontSize = "text-base"; // Reset to default
    }
  };

  const addImageBlock = async () => {
    const newBlock: ImageBlock = {
      id: Date.now().toString(),
      type: "image",
      src: contentEditableRef.current?.innerText || "",
      width: newImageWidth,
      height: newImageHeight,
    };
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock),
    });
    const data = await res.json();
    setBlocks([...blocks, data]);
    setContent("");
    if (contentEditableRef.current) {
      contentEditableRef.current.innerText = "";
      setPlaceholder("Type '/' for commands");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center text-black">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center">My Notion Clone</h1>
        {blocks.map((block) => (
          <div key={block.id}>
            {block.type === "text" && (
              <div
                className={
                  block.format === "H1"
                    ? "text-4xl"
                    : block.format === "H2"
                    ? "text-3xl"
                    : block.format === "H3"
                    ? "text-2xl"
                    : "text-base"
                }
              >
                {block.value}
              </div>
            )}
            {block.type === "image" && (
              <img
                src={block.src}
                width={block.width}
                height={block.height}
                alt="User uploaded"
              />
            )}
          </div>
        ))}
        <div>
          <div
            contentEditable
            ref={contentEditableRef}
            onKeyDown={handleKeyDown}
            onInput={(e) => {
              const text = e.currentTarget.innerText;
              setContent(text);
              if (text.length > 0) {
                setPlaceholder("");
              }
            }}
            onPaste={handlePaste}
            className="border border-gray-300 p-2 min-h-10 bg-white relative"
          >
            {content === "" && placeholder && (
              <div className="absolute top-2 left-2 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            )}
          </div>
          {showDropdown && (
            <div className="border border-gray-300 bg-white">
              {options.map((option, index) => (
                <div
                  key={option}
                  className={`p-2 ${
                    highlightedIndex === index ? "bg-gray-200" : "bg-white"
                  } hover:bg-gray-100 cursor-pointer`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
          {selectedOption === "image" && (
            <div className="flex mt-2">
              <input
                type="number"
                value={newImageWidth}
                onChange={(e) => setNewImageWidth(Number(e.target.value))}
                placeholder="Width"
                className="border border-gray-300 p-2 mr-2"
              />
              <input
                type="number"
                value={newImageHeight}
                onChange={(e) => setNewImageHeight(Number(e.target.value))}
                placeholder="Height"
                className="border border-gray-300 p-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
