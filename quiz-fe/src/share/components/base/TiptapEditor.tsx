"use client";

import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface TiptapEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function TiptapEditor({ value, onChange, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: value || '',
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  return (
    <div className={className} style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}>
      <EditorContent editor={editor} />
    </div>
  );
}
