import { CloudUpload, File, Image } from 'lucide-react';

export default function UploadDropzone({ label, hint, accept, required = false, file, onChange, kind = 'file' }) {
  const Icon = kind === 'image' ? Image : File;
  return (
    <label className="upload-dropzone">
      <input type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] || null)} />
      <span className="upload-dropzone__cloud"><CloudUpload size={32} /></span>
      <strong>{label}{required ? ' *' : ''}</strong>
      <small>{hint}</small>
      {file ? (
        <span className="upload-dropzone__file"><Icon size={15} /> {file.name}</span>
      ) : (
        <span className="upload-dropzone__cta">Bấm hoặc kéo tệp vào đây</span>
      )}
    </label>
  );
}
