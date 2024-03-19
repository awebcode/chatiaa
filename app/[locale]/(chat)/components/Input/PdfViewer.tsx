// components/pdfviewer.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer({file}:{file:File}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1); // start on first page
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
    setNumPages(nextNumPages);
  }

  function onPageLoadSuccess() {
    setPageWidth(window.innerWidth);
    setLoading(false);
  }

  const options = {
    cMapUrl: "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "standard_fonts/",
  };

  // Go to next page
  function goToNextPage() {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  }

  function goToPreviousPage() {
    setPageNumber((prevPageNumber) => prevPageNumber - 1);
  }

  return (
    <>
      {/* <Nav pageNumber={pageNumber} numPages={numPages} /> */}
      <div
        hidden={loading}
        // style={{ height: "calc(100vh - 64px)" }}
        className="flex items-center "
      >
        <div className="flex justify-center mx-auto">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            // options={options}
            renderMode="canvas"
            className="relative"
          >
            <Page
              className=""
              key={pageNumber}
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              onLoadSuccess={onPageLoadSuccess}
              onRenderError={() => setLoading(false)}
              width={Math.max(pageWidth * 0.8, 390)}
            />
            <div className="absolute bottom-0 right-0  flex items-center justify-between w-full bg-gray-400  z-10 px-2">
              <button
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1}
                className="relative  px-2   focus:z-20"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages!}
                className="relative  px-2   focus:z-20"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Document>
        </div>
      </div>
    </>
  );
}

function Nav({ pageNumber, numPages }: { pageNumber: number; numPages: number }) {
  return (
    <nav className="bg-black">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <p className="text-xl font-bold tracking-tighter text-white">Papermark</p>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium">
              <span>{pageNumber}</span>
              <span className="text-gray-400"> / {numPages}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
