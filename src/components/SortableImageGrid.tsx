
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { ImageItem } from '../types';
import { DragEndEvent } from '@dnd-kit/core';
import { SortableItem } from './SortableItem';

interface SortableImageGridProps {
    images: ImageItem[];
    onImagesReorder: (images: ImageItem[]) => void;
    onRemove: (id: string) => void;
}

export function SortableImageGrid({ images, onImagesReorder, onRemove }: SortableImageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((item) => item.id === active.id);
            const newIndex = images.findIndex((item) => item.id === over.id);

            onImagesReorder(arrayMove(images, oldIndex, newIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={images}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images.map((image) => (
                        <SortableItem
                            key={image.id}
                            id={image.id}
                            src={image.src}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
