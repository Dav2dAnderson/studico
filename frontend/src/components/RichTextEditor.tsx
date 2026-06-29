"use client";

import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['code', 'code-block'],
            ['link'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false,
        },
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'code', 'code-block',
        'link'
    ];

    const handleChange = (content: string) => {
        // Sanitize content to prevent &nbsp; insertion
        const sanitized = content
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ');
        onChange(sanitized);
    };

    return (
        <div className="rich-text-editor">
            <ReactQuill 
                theme="snow"
                value={value}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Write something amazing...'}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden"
            />
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    min-height: 250px;
                    font-size: 1rem;
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: rgb(226 232 240) !important;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    background-color: rgb(248 250 252);
                    border-color: rgb(226 232 240) !important;
                }
                
                /* Dark Mode Styles */
                .dark .rich-text-editor .ql-toolbar {
                    background-color: rgb(15 23 42);
                    border-color: rgb(51 65 85) !important;
                }
                .dark .rich-text-editor .ql-container {
                    border-color: rgb(51 65 85) !important;
                    background-color: rgb(15 23 42);
                }
                .dark .ql-stroke {
                    stroke: rgb(148 163 184) !important;
                }
                .dark .ql-fill {
                    fill: rgb(148 163 184) !important;
                }
                .dark .ql-picker {
                    color: rgb(148 163 184) !important;
                }
                .dark .ql-picker-options {
                    background-color: rgb(30 41 59) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .dark .ql-editor.ql-blank::before {
                    color: rgb(71 85 105) !important;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
