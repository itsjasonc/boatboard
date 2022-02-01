import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
	border: 1px solid lightgrey;
	padding: 8px;
	margin-bottom: 8px;
	border-radius: 2px;
	background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};
`;

export default class Boat extends React.Component {
	render() {
		return (
			<Draggable draggableId={this.props.boat._id} index={this.props.index}>
			{(provided, snapshot) => (
				<Container
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					isDragging={snapshot.isDragging}
				>
					{this.props.boat.name}
				</Container>
			)}
			</Draggable>
		);
	}
};
