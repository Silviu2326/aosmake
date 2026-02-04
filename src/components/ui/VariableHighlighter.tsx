import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface VariableHighlighterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string; // Should allow overriding styles
}

export const VariableHighlighter = forwardRef<HTMLTextAreaElement, VariableHighlighterProps>(
    ({ value, onChange, className = '', style, ...props }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const backdropRef = useRef<HTMLDivElement>(null);

        // Forward the ref while keeping internal access
        useImperativeHandle(ref, () => textareaRef.current!);

        // Sync scrolling
        const handleScroll = () => {
            if (backdropRef.current && textareaRef.current) {
                backdropRef.current.scrollTop = textareaRef.current.scrollTop;
                backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
            }
        };

        // Render highlighted text
        const renderHighlights = (text: string) => {
            // Split by variable regex {{...}}
            const parts = text.split(/(\{\{[^}]+\}\})/g);

            return parts.map((part, index) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                    // It's a variable
                    return (
                        <span
                            key={index}
                            className="bg-blue-500/30 text-blue-300 rounded px-0.5 mx-0.5 border border-blue-500/30 font-semibold"
                        >
                            {part}
                        </span>
                    );
                }
                // Regular text
                return <span key={index}>{part}</span>;
            });
        };

        // Calculate common styles to ensure perfect alignment
        // We need explicit specific styles for font handling
        const commonStyles: React.CSSProperties = {
            // fontFamily: 'monospace', // Removed to use class control
            fontSize: '12px',      // Fixed size or inherited, but must match
            lineHeight: '1.5',
            letterSpacing: 'normal',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            padding: '12px',       // Matching standard p-3 (3 * 4px = 12px)
            margin: 0,
            borderWidth: '1px',
            boxSizing: 'border-box',
            scrollbarGutter: 'stable', // Ensure scrollbar space is reserved equally
        };

        return (
            <div className={`relative w-full h-full group ${className} !p-0 !border-0`}>
                {/* Backdrop (Highlights) */}
                <div
                    ref={backdropRef}
                    className="absolute inset-0 pointer-events-none text-transparent overflow-hidden font-mono text-xs"
                    style={{
                        ...commonStyles,
                        borderColor: 'transparent',
                        backgroundColor: 'transparent',
                        color: 'transparent',
                        overflowY: 'auto', // Allow scrolling to match scrollbar gutter behavior (hidden via pointer-events)
                    }}
                >
                    {/* 
                      We need the text content to be visible for the backdrop, 
                      so we wrap non-highlighted text in standard color spans if needed,
                      or just let it inherit.
                      
                      Wait, if the textarea has 'color: transparent', then the user sees the backdrop.
                      So the backdrop must have the correct text color for normal text.
                     */}
                    {/* Inner div should purely inherit. No specific text classes that override line-height */}
                    <div
                        className="font-mono text-gray-300"
                        style={{
                            minHeight: '100%',
                            // inherit font/text styles from parent
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                        }}
                    >
                        {renderHighlights(value)}
                        {/* Add a zero-width space or break to ensure last empty line renders if ending in newline */}
                        {value.endsWith('\n') && <br />}
                    </div>
                </div>

                {/* Foreground (Textarea) */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onScroll={handleScroll}
                    className="absolute inset-0 w-full h-full bg-transparent resize-none focus:outline-none focus:ring-0 custom-scrollbar font-mono text-xs"
                    style={{
                        ...commonStyles,
                        color: 'transparent',
                        caretColor: 'white', // Cursor visible
                        borderColor: 'inherit', // Use border from parent/container
                        background: 'transparent',
                        overflowY: 'auto',
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    {...props}
                />
            </div>
        );
    }
);

VariableHighlighter.displayName = 'VariableHighlighter';
