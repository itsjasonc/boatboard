import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Boat from './boat';

export default class Swimlane extends React.Component {
	render() {
		return (
			<Col md="3" style={{ marginTop: "12px", marginBottom: "12px" }}>
				<Card fluid>
					<Card.Header>
						{this.props.swimlane.name}
					</Card.Header>
					<Card.Body>
						<Droppable droppableId={this.props.swimlane._id}>
							{(provided, snapshot) => (
								<Container
									ref={provided.innerRef}
									{...provided.droppableProps}
									isDraggingOver={snapshot.isDraggingOver}
									fluid
								>
									{this.props.boats.map((boat, index) => (
										<Boat key={boat._id} boat={boat} index={index} />
									))}
									{provided.placeholder}
								</Container>
							)}
						</Droppable>
					</Card.Body>
				</Card>
			</Col>
		);
	}
};
