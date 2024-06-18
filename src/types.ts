export type BlockType = "text" | "image";

export interface TextBlock {
  id: string;
  type: "text";
  value: string;
  format: "H1" | "H2" | "H3" | "paragraph";
}

export interface ImageBlock {
  id: string;
  type: "image";
  src: string;
  width: number;
  height: number;
}

export type Block = TextBlock | ImageBlock;
