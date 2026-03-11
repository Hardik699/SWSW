import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-slate-900/95 group-[.toaster]:to-slate-800/95 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-slate-700/50 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-lg group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-slate-300 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-blue-500 group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 hover:group-[.toast]:bg-blue-600",
          cancelButton:
            "group-[.toast]:bg-slate-700 group-[.toast]:text-slate-300 group-[.toast]:rounded-md",
          success:
            "group-[.toaster]:border-green-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-green-900/40 group-[.toaster]:to-slate-900/95",
          error:
            "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-red-900/40 group-[.toaster]:to-slate-900/95",
          warning:
            "group-[.toaster]:border-yellow-500/30 group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-yellow-900/40 group-[.toaster]:to-slate-900/95",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
