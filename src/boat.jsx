import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import CloseButton from 'react-bootstrap/CloseButton';
import socketIOClient from 'socket.io-client';

const Container = styled.div`
	border: 1px solid lightgrey;
	border-radius: 2px;
	padding: 8px;
	margin-bottom: 8px;
	background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};

	display: flex;
`;

const CloseContainer = styled.div`
	width: 24px;
	height: 25px;
	background-color: LightCoral;
	border-radius: 4px;

	margin-left: auto;
	order: 2;
`;

const requestURL = process.env.REACT_APP_BOATAPI_HOST + "/api";
const socketURL = process.env.REACT_APP_BOATWS_HOST;

export default class Boat extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isDeletingBoat: false,
			socket: null,
		};
	}

	componentDidMount() {
		// We don't receive messages here, we only send them
		this.state.socket = socketIOClient(socketURL);
	}

	handleDelete = (id) => {
		this.setState(prevState => ({
			isDeletingBoat: true
		}));

		const requestOptions = {
			method: "DELETE",
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Content-Type": "application/json",
			},
		};

		fetch(
			requestURL + "/boat/" + id, requestOptions
		).then((response) => {
			if (!response.ok) {
				throw new Error({ status: response.status, message: response.statusText });
			} else {
				this.state.socket.emit("message", {
					"type": "deleteBoat",
					"id": id,
				});
				this.setState(prevState => ({
					isDeletingBoat: false
				}));
			}
		}).catch((err) => {
			console.log(err);
			this.setState(prevState => ({
				isDeletingBoat: false
			}));
		});
	}


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
					<CloseContainer>
						<CloseButton
							disabled={this.state.isDeletingBoat}
							onClick={!this.state.isDeletingBoat ? () => this.handleDelete(this.props.boat._id) : null}/>
					</CloseContainer>
				</Container>
			)}
			</Draggable>
		);
	}
};
