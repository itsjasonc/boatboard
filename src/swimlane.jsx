import React from 'react';
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import Boat from './boat';

const Container = styled.div`
	margin: 8px;
	border: 1px solid lightgrey;
	border-radius: 2px;
	width: 220px;

	display: flex;
	flex-direction: column;
`;
const Title = styled.h3`
	font-size: 1.17em;
	font-weight: bold;
	padding: 8px;
`;
const BoatList = styled.div`
	padding: 8px;
	transition: background-color 0.2s ease;
	background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')};
	flex-grow: 1;
	min-height: 100px;
`;

export default class Swimlane extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Container>
				<Title>{this.props.swimlane.name}</Title>
				<Droppable droppableId={this.props.swimlane._id}>
					{(provided, snapshot) => (
						<BoatList
							ref={provided.innerRef}
							{...provided.droppableProps}
							isDraggingOver={snapshot.isDraggingOver}
						>
							{this.props.boats.map((boat, index) => (
								<Boat key={boat._id} boat={boat} index={index} />
							))}
							{provided.placeholder}
						</BoatList>
					)}
				</Droppable>
			</Container>
		);
	}
};
