import { useToast } from "@/hooks/use-toast";
import { Toast, ToastTitle, ToastDescription } from "./toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, variant, open }) => (
        open && (
          <Toast key={id} variant={variant} onClose={() => dismiss(id)}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </Toast>
        )
      ))}
    </div>
  );
}