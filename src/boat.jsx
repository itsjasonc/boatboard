import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import CloseButton from 'react-bootstrap/CloseButton';
import Card from 'react-bootstrap/Card';
import socketIOClient from 'socket.io-client';

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
		this.setState({
			socket: socketIOClient(socketURL),
		});
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
				<Card
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					isDragging={snapshot.isDragging}
					className={ snapshot.isDragging ? "bg-success" : "bg-light" }
					fluid
				>
					<Card.Header>
						<CloseButton
							className="float-end"
							disabled={this.state.isDeletingBoat}
							onClick={!this.state.isDeletingBoat ? () => this.handleDelete(this.props.boat._id) : null}
						/>
					</Card.Header>
					<Card.Body style={{ textAlign: 'center' }}>
					{this.props.boat.name}
					</Card.Body>
				</Card>
			)}
			</Draggable>
		);
	}
};
