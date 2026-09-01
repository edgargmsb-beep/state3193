import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mt-6 mb-2 text-xl font-bold text-slate-100 first:mt-0" {...props} />,
          h2: (props) => <h2 className="mt-5 mb-2 text-lg font-bold text-slate-100 first:mt-0" {...props} />,
          h3: (props) => <h3 className="mt-4 mb-1.5 text-base font-semibold text-slate-100 first:mt-0" {...props} />,
          p: (props) => <p className="mb-3" {...props} />,
          ul: (props) => <ul className="mb-3 list-disc space-y-1 ps-5" {...props} />,
          ol: (props) => <ol className="mb-3 list-decimal space-y-1 ps-5" {...props} />,
          li: (props) => <li {...props} />,
          strong: (props) => <strong className="font-semibold text-slate-100" {...props} />,
          a: (props) => (
            <a className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: (props) => <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-emerald-300" {...props} />,
          blockquote: (props) => (
            <blockquote className="border-s-2 border-slate-700 ps-3 text-slate-400 italic" {...props} />
          ),
          hr: () => <hr className="my-4 border-slate-800" />,
          table: (props) => (
            <div className="mb-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" {...props} />
            </div>
          ),
          th: (props) => <th className="border-b border-slate-700 px-2 py-1.5 text-slate-200" {...props} />,
          td: (props) => <td className="border-b border-slate-800 px-2 py-1.5" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
