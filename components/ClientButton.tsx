"use client";

type ClientButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

const ClientButton = ({ children,onClick }: ClientButtonProps) => {
  return (
    <button
      className="bg-secondary-color py-4 px-14 rounded text-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ClientButton;
