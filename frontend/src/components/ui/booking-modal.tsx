import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import type { ReactNode} from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: BookingFormData) => void;
    startTime: Date;
    endTime: Date;
    isLoading: boolean;
    error: Error | AxiosError<{ message: string }> | null;
}

const bookingSchema = z.object({
    isForSelf: z.boolean(),
    responsibleName: z.string().refine(() => true, {
        message: "Nome é obrigatório quando você não é o responsável"
    }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingModal({
    open,
    onClose,
    onSubmit,
    startTime,
    endTime,
    isLoading,
    error,
}: BookingModalProps): ReactNode {
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            isForSelf: true,
            responsibleName: user?.name ?? "",
        },
    });

    const isForSelf = watch("isForSelf");

    useEffect(() => {
        if (isForSelf && user?.name) {
            setValue("responsibleName", user.name);
        } else if (isForSelf) {
            setValue("responsibleName", "");
        }
    }, [isForSelf, user?.name, setValue]);

    const onSubmitWrapper = (data: BookingFormData): void => {
        if (!isForSelf && !data.responsibleName.trim()) {
            return;
        }
        onSubmit(data);
    };

    const formatTime = (date: Date): string => {
        return new Intl.DateTimeFormat("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(date);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => !isOpen && onClose()}
        >
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmitWrapper)}>
                    <DialogHeader>
                        <DialogTitle>Reservar Sala</DialogTitle>
                        <DialogDescription>
                            De {formatTime(startTime)} para {formatTime(endTime)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {error instanceof Error
                                    ? error.message
                                    : "Ocorreu um erro ao criar a reserva"}
                            </div>
                        )}

                        <div className="flex items-start space-x-2">
                            <input
                                type="checkbox"
                                id="isForSelf"
                                {...register("isForSelf")}
                                className="mt-1 h-4 w-4 rounded border-gray-300 focus:ring-primary"
                            />
                            <Label
                                htmlFor="isForSelf"
                                className="leading-tight"
                            >
                                Eu sou o responsável por essa reserva ({user?.name})
                            </Label>
                        </div>

                        {!isForSelf && (
                            <div className="grid gap-2">
                                <Label htmlFor="responsibleName">
                                    Nome do responsável
                                </Label>
                                <Input
                                    id="responsibleName"
                                    {...register("responsibleName", {
                                        required: !isForSelf,
                                        validate: (value) => isForSelf || value.trim().length > 0 || "Nome é obrigatório"
                                    })}
                                    placeholder="Insira o nome da pessoa responsável"
                                    className={errors.responsibleName ? "border-destructive" : ""}
                                />
                                {errors.responsibleName && (
                                    <p className="text-sm text-destructive">
                                        {errors.responsibleName.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Criando reserva..." : "Confirmar Reserva"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
