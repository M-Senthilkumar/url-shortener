import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiX, FiDownload, FiExternalLink } from "react-icons/fi";

export default function QRModal({ url, shortUrl, onClose }) {
  const svgRef = useRef(null);

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      URL.revokeObjectURL(blobUrl);
      const link = document.createElement("a");
      link.download = `qr-${url.shortCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = blobUrl;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="btn btn-ghost btn-icon modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="modal-title">QR Code</div>
        <div className="modal-subtitle" style={{ wordBreak: "break-all" }}>
          {shortUrl}
        </div>

        <div className="qr-container" ref={svgRef}>
          <QRCodeSVG
            value={shortUrl}
            size={220}
            level="H"
            includeMargin={false}
            fgColor="#1e1b4b"
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleDownload}>
            <FiDownload size={15} />
            Download PNG
          </button>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <FiExternalLink size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
