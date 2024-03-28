// Define a function to handle file download
export const handleDownload = async (url: string) => {
  try {
    // Fetch the file content as blob
    const response = await fetch(url);
    const blob = await response.blob();

    // Create a temporary anchor element
    const anchor = document.createElement("a");
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = `Messengaria_files_${Math.floor(Math.random() * 1000)}`; // Set the download attribute to specify the file name
    anchor.click();

    // Cleanup
    window.URL.revokeObjectURL(anchor.href);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};
