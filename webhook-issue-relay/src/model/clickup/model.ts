import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { findListByProjectId, findListByMemberId, findListByWorkFlowId } from '../../common/model'
import { getDoorayPostId, IRequestDoorayCreateTask, requestDoorayToUpdateTask, requestDoorayUpdateWorkId, requestDoorayToCreateTaskComment, requestDoorayGetTask, requestDoorayToCreateTask } from '../dooray/model'
import { findMyroMemberById } from '../member/find';
import { updateTaskId, updateTaskStatus } from '../task/update'
import { findMyroTaskById } from '../task/find'
// workflow clickup to dooray
// clickup event(automation) -> webhook(clickup format) -> lambda -> request to dooray api
export type IWebhookFromClickup = {
	webhook_id?: string,
	event?: string,
	task_id?: string,
	history_items?: []
}


// 클릭업 요청 Task Comment Interface
export type IRequestClickupCreateTaskComment = {
  comment_text?: string,
  notify_all?: boolean
}

// 클릭업 요청 Task Interface
export type IRequestClickupCreateTask = {
	name?: string,
	description?: string,
	assignees?: [ string ],
	tags?: any,
	status?: string,
	priority?: string,
	due_date?: number,
	due_date_time?: boolean,
	time_estimate?: number,
	start_date?: number,
	start_date_time?: number,
	notify_all?: number,
	parent?: null | number,
	links_to?: null | number,
	check_required_custom_fields?: boolean,
	custom_fields?: [ 
		// {
		// 	id: 0a52c486-5f05-403b-b4fd-c512ff05131c,
		// 	value: 23
		// },
		// {
		// 	id: 03efda77-c7a0-42d3-8afd-fd546353c2f5,
		// 	value: Text field input
		// }
	]

}

export type IResponseClickUpTask = {
	id: string,
	name: string,
	text_content?: string,
	description?: string,
	status?: {},
	creator?: {},
	team_id?: string,
	url?: string,
	list?: {},
	project?: {},
	folder?: {},
	space?: {},
	attachments?:[]
}


export const requestClickupGetWebHook = async() => {
	const url = `https://api.clickup.com/api/v2/team/1234/webhook`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		}
	});
}

export const requestClickupCreateWebHook = async() => {
	const url = `https://api.clickup.com/api/v2/team/1234/webhook`
	const param = {
		"endpoint": "https://amazonaws.com/prod/clickup2dooray/sync-task",
		"events": [
		  "taskCreated",
		  "taskUpdated",
		  "taskDeleted"
		]
	  }
	return await axios.post(url, param, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	})
}

export const requestClickupUpdateWebHook = async() => {
	const url = `https://api.clickup.com/api/v2/webhook/12341`
	const param = {
		"endpoint": "https://aws.com/prod/clickup2dooray/sync-task",
		"events": [
			"taskCreated",
			"taskUpdated",
			"taskStatusUpdated",
			"taskCommentPosted",
			"taskAssigneeUpdated"
		],
		"status": "active"
	  }
	return await axios.put(url, param, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	})
}


export const requestClickupListMember = async(listNumber: string) => {
	const url = `https://api.clickup.com/api/v2/list/${listNumber}/member`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		}
	}).catch((err) =>{
		console.log(err)
	});
}

export const requestClickupGetTasks = async(projectId: string) => {
	const url = `https://app.clickup.com/api/v2/list/${projectId}/task`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		}
	}).catch((err) =>{
		console.log(err)
	});
}

export const requestClickupGetTaskComments = async(taskId: string) => {
	const url = `https://app.clickup.com/api/v2/task/${taskId}/comment`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		}
	}).catch((err) =>{
		console.log(err)
	});
}

// https://api.clickup.com/api/v2/task/task_id/comment?custom_task_ids=&team_id=
export const requestClickupToCreateTaskComment = async(taskId: string, param: IRequestClickupCreateTaskComment) => {
	const url = `https://app.clickup.com/api/v2/task/${taskId}/comment`;
	return await axios.post(url, param, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}


export const requestClickupToUpdateTask = async (taskId: string, param: IRequestClickupCreateTask) => {
	const url = `https://app.clickup.com/api/v2/task/${taskId}`;
	return await axios.put(url, param, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}


export const requestClickupToUpdateCustoFieldTask = async (taskId: string, param: IRequestClickupCreateTask) => {
	const url = `https://app.clickup.com/api/v2/task/${taskId}/?custom_task_ids=true&team_id=1234`;
	return await axios.put(url, param, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}


export const requestClickupToCreateTask = async (listNumber: string, param: IRequestClickupCreateTask) => {
	const url = `https://app.clickup.com/api/v2/list/${listNumber}/task`;
	return await axios.post(url, param, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

export const requestClickupToDeleteTask = async (taskId: string) => {
	const url = `https://app.clickup.com/api/v2/task/${taskId}`;
	return await axios.delete(url, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

export const requestClickupGetTask = async(taskId: string) => {
	const url = `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.CLICKUP_API_KEY,
			"Content-Type": "application/json"
		}
	});
}


export const getClickupAuthorizationCode = async () => {
	// https://app.clickup.com/api?client_id={client_id}&redirect_uri={redirect_uri}

	const url = "https://app.clickup.com/api/?client_id=" + process.env.CLICKUP_CLIENT_ID + "&redirect_uri=http://localhost:3000/dev/dooray2clickup/create-task";

	return await axios.get(url);
}

export const getClickupAccessToken = async (code) => {

	const url = "https://app.clickup.com/api/v2/oauth/token?client_id=" + process.env.CLICKUP_CLIENT_ID + "&client_secret=" + process.env.CLICKUP_SECRET_KEY + "&code=" + code;
	return await axios.post(url);
}


export const getClickupTeam = async () => {

	const url = "https://api.clickup.com/api/v2/team";
	return await axios.get(url, {
		headers: {
			"Authorization": "pk_5987505_8WELHANRBTXI2WH36HE4PL4TSS2QHMWH",
			"Content-Type": "application/json"
		},
	});
}


export const getClickupComment = (clickupWebhook: IWebhookFromClickup) => {
	const commentData = clickupWebhook.history_items[0].comment.comment
	const user = clickupWebhook.history_items[0].comment.user
	let comment = ""
	for(let obj of commentData){
		if(obj.attachment){
			comment += obj.attachment.url + "\n"  + "FileName: " + obj.attachment.title
		} else{
			comment += "\n" + obj.text + "\n"
		}
	}
	comment += "\n From Clickup" 
	return comment
}


export const getClickupTaskId = (doorayWebhook: IWebhookFromDooray, clickupTasks: any) => {
	let dooraySubject = doorayWebhook.post.subject.replace(/ /gi, "")

	for(let obj of clickupTasks.data.tasks){
		if(dooraySubject==obj.name.replace(/ /gi, "")){
			return obj.id
		}
	}
}


export const getAssignees = (clickupTask: any) => {

	let list = []
	let assignees = clickupTask.data.assignees
	for (let obj of assignees){
		let member = {                                    /* 업무 담당자 목록 */
			type: "member",
			member: {
				organizationMemberId: ""
			}
		} 
		member.member.organizationMemberId = findListByMemberId(obj.id.toString())

		list.push(member)
	}

	
	if(list){
		return list
	}
}

export const taskCreated = async (clickupWebhook: IWebhookFromClickup) => {
	const clickupTask = await requestClickupGetTask(clickupWebhook.task_id)

	const listNumber = clickupTask.data.list.id
	const projectId = findListByProjectId(listNumber)

	const customFieldId = "f7242db7-4ff4-4400-85d8-14b21dd03890"
	const postId = getDoorayPostId(clickupTask, customFieldId)
	const userId = clickupWebhook.history_items[0].user.id
	//Sub Task Exclude
	const taskTitle = clickupTask.data.name

	if(postId === undefined && projectId !== undefined && taskTitle.indexOf("ST)")==-1 && projectId != "2531758068456824356") {

		const taskCreator = findListByMemberId(userId) ? findListByMemberId(userId) : ""
		const content =  JSON.stringify({ id : clickupWebhook.task_id, member : taskCreator })

		//Dooray Request 
		let request: IRequestDoorayCreateTask = taskCreator ? {
			parentPostId: "1", 
			users: {
				to: [{                                    /* 업무 담당자 목록 */
					type: "member",
					member: {
						organizationMemberId: taskCreator
					}
				}],
			},
			subject: clickupTask.data.name,
			body: {
				mimeType: "text/html",                    /* text/html text/x-markdown */
				content: content          				  /* 업무 본문 */
			},
			dueDateFlag: true,
			milestoneId: "1",
			priority: "none",
			tagIds: []
		}  : {
			parentPostId: "1", 
			subject: clickupTask.data.name,
			body: {
				mimeType: "text/html",                    /* text/html text/x-markdown */
				content: content           				  /* 업무 본문 */
			},
			dueDateFlag: true,
			milestoneId: "1",
			priority: "none",
			tagIds: []
		}
	

		// if(deployTarget){
		// 	let tagId = findListByTagId(deployTarget.id)
		// 	request.tagIds = tagId ? [ tagId ] : []
		// }
		const doorayApiKey = await findMyroMemberById(clickupWebhook)
		await requestDoorayToCreateTask(projectId, doorayApiKey, request)
		.then(res => {
			console.log("=================>1", res.data);
		}).catch(err => {
			console.log("=================>2", err);
		});
	
		console.log("request DynamoDB Task Successful!!")

	} else if(postId){
		await updateTaskId(clickupWebhook.task_id, postId)
		.then(res => {
			console.log("Success: update DynamoDB Task ID", res)
		}).catch(err => {
			console.log("Error: update DynamoDB Task ", err )
		})
	}
}

export const taskCommentPosted  = async (clickupWebhook: IWebhookFromClickup) => {
	const comment = await getClickupComment(clickupWebhook);
	const clickupTask = await requestClickupGetTask(clickupWebhook.task_id)
	const listNumber = clickupTask.data.list.id
	const projectId = findListByProjectId(listNumber)
	const customFieldId = "f7242db7-4ff4-4400-85d8-14b21dd03890"
	const postId = getDoorayPostId(clickupTask, customFieldId)
	const taskTitle = clickupTask.data.name

	if(projectId!==undefined && postId!==undefined && taskTitle.indexOf("ST)")==-1){
		if(comment.lastIndexOf('From Dooray')==-1){
			const doorayTask = await requestDoorayGetTask(projectId, postId)
				
			if(doorayTask){
					
				const doorayApiKey = await findMyroMemberById(clickupWebhook)
				let request: IRequestDoorayCreateTask = {
					body: {
						mimeType: "text/x-markdown",                    			/* text/html text/x-markdown */
						content: comment            /* 업무 본문 */
					}
				}
				console.log(doorayApiKey)
				await requestDoorayToCreateTaskComment(projectId, postId, doorayApiKey, request)
				.then(res => {
					console.log("=================>1", res.data);
				})
				.catch(err => {
					console.log("=================>2", err);
				});
						
			} else {
				console.log("Dooray Task Does not Exist")
			}
		} else {
			console.log("Comment is Exist")
		}
	}
}


export const taskUpdated = async (clickupWebhook: IWebhookFromClickup) => {
	const clickupTask = await requestClickupGetTask(clickupWebhook.task_id)
	const listNumber = clickupTask.data.list.id
	const projectId = findListByProjectId(listNumber)
	const customFieldId = "f7242db7-4ff4-4400-85d8-14b21dd03890"
	const postId = getDoorayPostId(clickupTask, customFieldId)
	const taskTitle = clickupTask.data.name

	if(projectId!==undefined && postId!==undefined && taskTitle.indexOf("ST)")==-1 && projectId != "1234"){

		const doorayTask = await requestDoorayGetTask(projectId, postId)

		if(doorayTask){
			const doorayApiKey = await findMyroMemberById(clickupWebhook)
		
			let request: IRequestDoorayCreateTask = {
				subject: clickupTask.data.name,
				body: {
					mimeType: "text/x-markdown",                 /* text/html text/x-markdown */
					content: clickupTask.data.text_content          /* 업무 본문 */
					}
			}
			await requestDoorayToUpdateTask(projectId, postId, doorayApiKey, request)
			.then(res => {
				console.log("=================>1", res.data);
			})
			.catch(err => {
				console.log("=================>2", err);
			});
			
		} else {
			console.log("Dooray Task Does not Exist")
		}
	}
}

export const taskAssigneeUpdated = async (clickupWebhook: IWebhookFromClickup) => {
	const clickupTask = await requestClickupGetTask(clickupWebhook.task_id)

	const listNumber = clickupTask.data.list.id
	const projectId = findListByProjectId(listNumber)

	const customFieldId = "f7242db7-4ff4-4400-85d8-14b21dd03890"
	const postId = getDoorayPostId(clickupTask, customFieldId)
	const taskTitle = clickupTask.data.name

	const assignees = getAssignees(clickupTask) ? getAssignees(clickupTask) : ""
		
	if(projectId!==undefined && postId!==undefined && taskTitle.indexOf("ST)")==-1){
		const doorayTask = await requestDoorayGetTask(projectId, postId)
	
		if(doorayTask){
			
			const doorayApiKey = await findMyroMemberById(clickupWebhook)
		
			let request: IRequestDoorayCreateTask = assignees ? {
				users: {		
					// to: assignees
					to: assignees
					// type: "giyong@lastorder.co.kr"
				},
				subject: clickupTask.data.name,
				body: {
					mimeType: "text/x-markdown",                 /* text/html text/x-markdown */
					content: clickupTask.data.text_content          /* 업무 본문 */
				}	
			} : ""

			if(request){
				await requestDoorayToUpdateTask(projectId, postId, doorayApiKey, request)
				.then(res => {
					console.log("=================>1", res.data);
				})
				.catch(err => {
					console.log("=================>2", err);
				});
			} 
			else 
				console.log("Dooray Task Does not Exist")
		
		}

	}
}
export const taskStatusUpdated = async (clickupWebhook: IWebhookFromClickup) => {
	if(clickupWebhook.history_items.length>0){

		const clickupTask = await requestClickupGetTask(clickupWebhook.task_id)

		const listNumber = clickupTask.data.list.id
		const projectId = findListByProjectId(listNumber)
	
		const customFieldId = "f7242db7-4ff4-4400-85d8-14b21dd03890"
		const postId = getDoorayPostId(clickupTask, customFieldId)
		
		//Sub Task Exclude
		const taskTitle = clickupTask.data.name
		//ClickUp workFlowStatus -> DoorayWorkFlowId Get
		const workFlowId = findListByWorkFlowId(clickupWebhook.history_items[0].after.status)
		console.log(clickupWebhook.history_items[0].after.status)
		console.log(workFlowId)

		if(projectId!==undefined && postId!==undefined && taskTitle.indexOf("ST)")==-1){
			const doorayTask = await requestDoorayGetTask(projectId, postId)

			if(doorayTask){
				const doorayApiKey = await findMyroMemberById(clickupWebhook)
				console.log(doorayApiKey)
				const task = await findMyroTaskById(postId)
				console.log(task)
				if(task.taskStatus!==workFlowId){
					//Dooray Post WorkFlowId Update 
					await requestDoorayUpdateWorkId(projectId, postId, doorayApiKey, workFlowId)
					.then(res => {
						console.log("=================>1", res.data);
					})
					.catch(err => {
							console.log("=================>2", err);
					});
	
					await updateTaskStatus(workFlowId, postId)
					.then(res => {
						console.log(res, "Success: update DynamoDB Task Status")
					}).catch(err => {
						console.log(err)
					})
				} else{
					console.log("DynamoDB Status does not update ")
				}


			}

		}
	}


}


export const clickupSyncTask = async (clickupWebhook: IWebhookFromClickup) => {
	
	switch(clickupWebhook.event){
		case "taskCreated":
			await taskCreated(clickupWebhook)
			break;
		case "taskStatusUpdated":
			await taskStatusUpdated(clickupWebhook)
			break;
		case "taskCommentPosted":
			await taskCommentPosted(clickupWebhook)
			break;
		case "taskUpdated":
			await taskUpdated(clickupWebhook)
			break;
		case "taskAssigneeUpdated":
			await taskAssigneeUpdated(clickupWebhook)
			break;
	}
}