import { MoreVertical } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookingActionsProps {
    onEdit: () => void;
    onEditTime: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const BookingActions = ({
    onEdit,
    onEditTime,
    onCancel,
    isLoading = false,
}: BookingActionsProps): ReactNode => {
    return (
        <>
            <div className="hidden sm:flex sm:gap-4">
                <Button
                    variant="outline"
                    onClick={onEdit}
                    disabled={isLoading}
                >
                    Editar
                </Button>
                <Button
                    variant="outline"
                    onClick={onEditTime}
                    disabled={isLoading}
                >
                    Reagendar
                </Button>
                <Button
                    variant="destructive"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
            </div>

            <div className="sm:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={isLoading}
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onEditTime}>
                            Reagendar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onCancel}
                            className="text-destructive focus:text-destructive"
                        >
                            Cancelar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};

export default BookingActions;
