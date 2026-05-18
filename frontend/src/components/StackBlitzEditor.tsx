'use client';

import { useEffect, useRef } from 'react';
import sdk from '@stackblitz/sdk';

export default function StackBlitzEditor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      sdk.embedProject(
        containerRef.current,
        {
          title: 'Ada Demo Project',
          description: 'A basic HTML/JS project for the Ada AI Tutor.',
          template: 'javascript',
          files: {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
  </style>
</head>
<body>
  <h1>Hello from Ada!</h1>
  <p>Write your code here.</p>
  <script src="index.js"></script>
</body>
</html>`,
            'index.js': `console.log("Welcome to Ada's coding playground!");\n`
          },
          settings: {
            compile: {
              trigger: 'auto',
              clearConsole: false,
            },
          },
        },
        {
          openFile: 'index.js',
          height: '100%',
          width: '100%',
          hideExplorer: false,
          hideNavigation: true,
          forceEmbedLayout: true,
        }
      );
    }
  }, []);

  return (
    <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex-grow">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
