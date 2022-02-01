import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import styled from 'styled-components';
import 'reset-css';
import { DragDropContext } from 'react-beautiful-dnd';

import Swimlane from './swimlane';

const Container = styled.div`
	display: flex;
`;

const requestURL = "http://ec2-3-96-46-136.ca-central-1.compute.amazonaws.com:3001/api";

class App extends React.Component {
	
	// Constructor
	constructor(props) {
		super(props);

		/*
		 * DB
		 * ====================
		 * Swimlane {
		 * 	_id: ObjectId
		 * 	name: String
		 * }
		 * Boat {
		 * 	_id: ObjectId
		 * 	name: String
		 * 	inLane: ObjectId Ref Swimlane
		 * }
		 *
		 * React Display
		 * ====================
		 * Swimlanes [
		 * 	{
		 * 		"_id": "",
		 * 		"name": "",
		 *		"boatsIds": [],
		 *	}
		 * ]
		 *
		 * SwimlaneOrder [
		 * 	"_id", "_id", ...
		 * ]
		 */

		/*
		this.state = {
			swimlanes: [],
			boats: [],
			swimlaneOrder: [],
			DataisLoaded: false,
		};
		*/
		this.state = {
			swimlanes: [],
			boats: [],
			swimlaneOrder: [],
			DataisLoaded: false,
		};
	}

	// ComponentDidMount is used to execute the API fetch
	componentDidMount() {
		const requestOptions = {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
		};

		Promise.all([
			fetch(requestURL + "/swimlane", requestOptions), //.then(response => response.json()),
			fetch(requestURL + "/boat", requestOptions), //.then(response => response.json()),
		]).then(
			results => Promise.all(results.map(r => r.json()))
		).then(([swimlanes, boats]) => {
			// Potentially there may be no swimlanes and boats
			// so we check if data is loaded rather then checking if the array length is 0
			var data = {
				swimlanes: swimlanes,
				boats: boats,
				swimlaneOrder: [],
				DataisLoaded: true
			};
			if (data.swimlanes.length > 0) {
				data.swimlanes.forEach(swimlane => {
					data.swimlaneOrder.push(swimlane._id);
				});
			}

			this.setState(data);
		});
	}

	onDragEnd = result => {
		const {destination, source, draggableId } = result;

		// There was no drag destination
		if (!destination) {
			return;
		}

		// The user picked up a boat but never moved it anywhere upon release
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// The swimlane we started dragging from
		const startSwimlane = this.state.swimlanes.filter(swimlane => swimlane._id === source.droppableId)[0];
		// The swimlane we stopped dragging from
		const finishSwimlane = this.state.swimlanes.filter(swimlane => swimlane._id === destination.droppableId)[0];
		
		if (startSwimlane._id === finishSwimlane._id) {
			// TODO: Reordering of boats in a swimlane
			

			return;
		} else {
			// const startBoatList = Array.from(startSwimlane
			const requestOptions = {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ inLane: destination.droppableId })
			};

			fetch(
				requestURL + "/boat/" + draggableId, requestOptions
			).then(
				response => response.json()
			).then(result => {
				// Update the Boat list inLane id
				const newBoats = Array.from(this.state.boats);
				newBoats.filter(boat => boat._id === result._id).map(boat => {
					boat.inLane = destination.droppableId;
				});
				const newState = {
				...this.state,
					boats: newBoats
				};
				this.setState(newState);
			});
		}

		/*
		// Getting the swimlane and boat
		const swimlane = this.state.swimlanes.filter(swimlane => swimlane._id === source.droppableId)[0];
		const boat = this.state.boats.filter(boat => boat._id === draggableId)[0];

		// Removing the dragged boat from the BoatList in the Swimlane
		const newBoats = Array.from(this.state.boats);
		newBoats.splice(source.index, 1);
		newBoats.splice(destination.index, 0, boat);

		const newBoat = {
			boat,
			inLane: 
		};

		const newState = {
			this.state,
			boats: {
				this.state.boats,
				[newBoat
			},
		};

		this.setState(newState);
		*/
	}

	render() {
		// Wait for the data to be fetched..
		const { DataisLoaded } = this.state;
		if (!DataisLoaded) {
			return (
				<div>
					<h1>Fetching data...</h1>
				</div>
			);
		} else {
			// Data has been loaded
		}

		return (
			<DragDropContext
				onDragEnd={this.onDragEnd}
			>
				<Container>
				{
					this.state.swimlaneOrder.map(swimlaneOrderIndex => {
						const swimlane = this.state.swimlanes.filter(swimlane => swimlane._id === swimlaneOrderIndex)[0];
						const boats = this.state.boats.filter((boat) => boat.inLane === swimlane._id);

						return <Swimlane key={swimlane._id} swimlane={swimlane} boats={boats} />;
					})
				}
				</Container>
			</DragDropContext>
		);
	}
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
