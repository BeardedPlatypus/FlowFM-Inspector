import * as React from "react"
import { PageProps } from "gatsby"
import Layout from "../components/layout"

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// fake data generator
const getItems = count =>
    Array.from({ length: count }, (v, k) => k).map(k => ({
        id: `item-${k}`,
        content: `item ${k}`
    }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle, isDropAnimating, isDraggingOver) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
    // TODO: figure out how to not generate warnings here.
    transitionDuration: isDropAnimating && !isDraggingOver ? `0.00001s` : draggableStyle.transitionDuration
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});


const ListTestPage: React.FC<PageProps> = () => {
    const [items, setItems] = React.useState(getItems(8))

    function onDragEnd(result) {
        let newItems;

        if (!result.destination) {
            newItems = Array.from(items);
            newItems.splice(result.source.index, 1)
        }
        else {
            newItems = reorder(
                items,
                result.source.index,
                result.destination.index
            );
        }

        setItems(newItems);
    }

    return (
        <Layout>
            <div className="column">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided, droppableSnapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={getListStyle(droppableSnapshot.isDraggingOver)}
                            >
                                {items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style,
                                                    snapshot.isDropAnimating,
                                                    droppableSnapshot.isDraggingOver,
                                                )}
                                            >
                                                {item.content}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </Layout>
    )
}

export default ListTestPage