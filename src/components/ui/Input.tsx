import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary-900">
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-primary-100 bg-white px-4 py-3 text-primary-900",
          "placeholder:text-text-muted transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/25",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary-900">
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-primary-100 bg-white px-4 py-3 text-primary-900",
          "placeholder:text-text-muted transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/25",
          "min-h-[120px] resize-y",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary-900">
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-primary-100 bg-white px-4 py-3 text-primary-900",
          "transition focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/25",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      >
        <option value="">Sélectionner...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function FileInput({ label, error, className, id, ...props }: FileInputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary-900">
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        type="file"
        className={cn(
          "w-full rounded-xl border border-dashed border-accent-200 bg-accent-50/30 px-4 py-3",
          "file:mr-4 file:rounded-lg file:border-0 file:bg-secondary-200 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-900",
          "hover:border-accent-400 transition",
          error && "border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
