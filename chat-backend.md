Accessing the application

Open API Client Execute POST /rooms with body { "room_name": "Room 1", "topic": "Ethics", "created_by": "Admin" }

Execute POST /rooms/join with body { "room_id": "<id from the first endpoint's response>", "userId": ":userId" }

Execute POST /rooms/join with body { "room_id": "<id from the first endpoint's response>", "userId": ":userId" }

Open web socket client 1 with following WS URL: ws://api.dhruvshah.se/ws/:roomId/:userId

Open web socket client 2 with following WS URL: ws://api.dhruvshah.se/ws/:roomId/:userId


Chat room id: 1577494c-249a-48e2-9b60-4b2a158f40d0