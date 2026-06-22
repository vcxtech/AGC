"use client";

import type { ReactNode } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  initialHtml: string;
  onHtmlChange: (html: string) => void;
  placeholder?: string;
  /** Associate with a <label htmlFor={editorId}> */
  editorId?: string;
  /** Shorter editor for sidebars and card bodies. */
  compact?: boolean;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-slate-700 transition-colors",
        active ? "border-border bg-white shadow-sm" : "hover:bg-slate-200/80",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-border bg-slate-50 px-2 py-1.5"
      role="toolbar"
      aria-label="Formatting"
    >
      <ToolbarButton
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px bg-slate-300" aria-hidden />
      <ToolbarButton
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 4"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive("heading", { level: 4 })}
      >
        <Heading4 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px bg-slate-300" aria-hidden />
      <ToolbarButton
        title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Link" onClick={setLink} active={editor.isActive("link")}>
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px bg-slate-300" aria-hidden />
      <ToolbarButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ initialHtml, onHtmlChange, placeholder, editorId, compact }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write the article body…",
      }),
    ],
    content: initialHtml || "",
    editorProps: {
      attributes: {
        ...(editorId ? { id: editorId } : {}),
        class: cn(
          compact ? "min-h-[140px] px-3 py-2 text-slate-900 outline-none" : "min-h-[220px] px-3 py-2 text-slate-900 outline-none",
          "[&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold",
          "[&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_h4]:mt-2 [&_h4]:text-base [&_h4]:font-semibold",
          "[&_ul]:ml-6 [&_ul]:list-disc",
          "[&_ol]:ml-6 [&_ol]:list-decimal",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_a]:text-accent-600 [&_a]:underline"
        ),
      },
    },
    onCreate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
    },
    onUpdate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
    },
  });

  return (
    <div className="rounded-lg border border-border bg-white">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn(
          "admin-rich-text",
          compact ? "[&_.ProseMirror]:min-h-[140px]" : "[&_.ProseMirror]:min-h-[220px]"
        )}
      />
    </div>
  );
}
