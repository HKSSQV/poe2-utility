import { useEffect, useState, type ReactNode } from "react";
import { REGEX_CHAR_LIMIT, regexStatus } from "../tablet/buildRegex";
import { encodeFilterCode, tradeSearchUrl } from "../tablet/tradeSearch";

/** Displays regex and trade search results in a row-by-row result bar. */
export function SearchOutputs({
  regex,
  tradeQuery,
  league,
  note,
}: {
  regex: string;
  tradeQuery: Record<string, unknown>;
  league: string;
  note?: ReactNode;
}) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const status = regexStatus(regex);

  useEffect(() => {
    let alive = true;
    encodeFilterCode(tradeQuery)
      .then((value) => alive && setCode(value))
      .catch(() => alive && setCode(""));
    return () => {
      alive = false;
    };
  }, [tradeQuery]);

  const copy = async () => {
    if (!regex) return;
    try {
      await navigator.clipboard.writeText(regex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="search-out" aria-label="Search Results">
      <div className="search-out-row">
        <span className="search-out-label">Regex</span>
        <code title={regex} className={regex ? undefined : "empty"}>
          {regex || "Select options to generate"}
        </code>
        <button type="button" className="btn btn-primary" disabled={!regex} onClick={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="search-out-row">
        <span className="search-out-label">Trade</span>
        <code title={code}>{code || "…"}</code>
        <a className="btn btn-primary" href={tradeSearchUrl(league, tradeQuery)} target="_blank" rel="noreferrer">
          Search
        </a>
      </div>
      {(status.overLimit || note) && (
        <div className="search-out-note">
          {status.overLimit && (
            <span className="warn">
              Regex length is {status.length}, exceeding the limit of {REGEX_CHAR_LIMIT} characters.
            </span>
          )}
          {note}
        </div>
      )}
    </section>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={value === option.id ? "active" : ""}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Labeled control group container */
export function ControlGroup({
  label,
  children,
  className,
  bodyClassName,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`ctrl-group${className ? ` ${className}` : ""}`}>
      <span className="ctrl-label">{label}</span>
      <div className={`ctrl-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>{children}</div>
    </div>
  );
}
