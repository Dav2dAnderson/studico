"use client";

import React, { useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorComponentProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
}

const CKEditorComponent: React.FC<CKEditorComponentProps> = ({ value, onChange, placeholder }) => {
    const handleChange = (event: any, editor: any) => {
        const data = editor.getData();
        // Sanitize content to prevent &nbsp; insertion
        const sanitized = data
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ');
        onChange(sanitized);
    };

    useEffect(() => {
        // Inject CKEditor styles dynamically
        const styleId = 'ckeditor-custom-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .ck-editor__editable_inline {
                    min-height: 300px;
                    border-bottom-left-radius: 0.75rem !important;
                    border-bottom-right-radius: 0.75rem !important;
                    background-color: transparent !important;
                    color: inherit !important;
                }
                .ck-toolbar {
                    border-top-left-radius: 0.75rem !important;
                    border-top-right-radius: 0.75rem !important;
                    background-color: rgb(248 250 252) !important;
                    border-color: rgb(226 232 240) !important;
                }
                .dark .ck-toolbar {
                    background-color: rgb(15 23 42) !important;
                    border-color: rgb(51 65 85) !important;
                }
                .dark .ck-toolbar__items button:hover {
                    background-color: rgb(30 41 59) !important;
                }
                .dark .ck-content {
                    background-color: rgb(15 23 42) !important;
                    color: rgb(241 245 249) !important;
                    border-color: rgb(51 65 85) !important;
                }
                .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused) {
                    border-color: rgb(226 232 240) !important;
                }
                .dark .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused) {
                    border-color: rgb(51 65 85) !important;
                }
                .ck.ck-editor__main>.ck-editor__editable.ck-focused {
                    border-color: rgb(79 70 229) !important;
                    box-shadow: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div className="prose-none ck-editor-wrapper">
            <CKEditor
                editor={ClassicEditor as any}
                data={value}
                config={{
                    placeholder: placeholder || 'Type your content here...',
                    toolbar: [
                        'heading', '|',
                        'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                        'code', 'codeBlock', '|',
                        'undo', 'redo'
                    ]
                }}
                onChange={handleChange}
            />
        </div>
    );
};

export default CKEditorComponent;
