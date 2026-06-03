"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDemoCSV } from "@/data/demo-data";

interface FileUploadProps {
  onData: (rows: Record<string, string>[]) => void;
  onClose: () => void;
  error: string | null;
}

export function FileUpload({ onData, onClose, error }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [parsing,  setParsing]  = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(async (file: File) => {
    setParsing(true);
    setLocalErr(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv" || ext === "txt") {
        const Papa = (await import("papaparse")).default;
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            onData(result.data as Record<string, string>[]);
            onClose();
          },
          error: (err: Error) => setLocalErr(err.message),
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        onData(rows);
        onClose();
      } else {
        setLocalErr("Please upload a CSV (.csv) or Excel (.xlsx) file.");
      }
    } catch (e) {
      setLocalErr(`Parse error: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setParsing(false);
    }
  }, [onData, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const downloadTemplate = () => {
    const csv = generateDemoCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "preseason-template.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  const displayError = localErr ?? error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg card p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">Upload Evaluation Data</h2>
          <p className="text-sm text-slate-400 mt-1">Import a CSV or Excel file. The first row must be column headers.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-150",
            dragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/15 hover:border-white/30 hover:bg-white/5"
          )}
        >
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
          {parsing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Parsing file…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Drop your file here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">CSV or Excel (.csv, .xlsx)</p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {displayError && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {displayError}
          </div>
        )}

        {/* Template section */}
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/8">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Expected column headers</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-mono mb-1">
            <strong className="text-slate-400">Long format (normative):</strong> athlete_id · demo_sex · demo_sport · demo_age_years · demo_year_of_study · cohort_is_injured · cohort_exclude_from_analysis · task · trial_id · trial_num · side · include_for_modeling_strict · manual_exclude · metric · label · unit · value
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            <strong className="text-slate-400">Wide format:</strong> athlete_name · position · session_date · sex · cmj_jump_height_m · cmj_takeoff_velocity_ms · ddj_rsi_final · ddj_rsi_asymmetry · …
          </p>
          <button
            onClick={downloadTemplate}
            className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download template CSV
          </button>
        </div>
      </div>
    </div>
  );
}
