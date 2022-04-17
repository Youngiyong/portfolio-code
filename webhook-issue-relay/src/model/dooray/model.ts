import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { isJson, findListByMemberId, findListByProjectId, findListByPriorityrId, findListByTagId, findListByWorkFlowId, findProjectIdByListId, findListByClickupWorkFlowId } from '../../common/model';
import { requestClickupToDeleteTask, requestClickupGetTasks, getClickupTaskId, requestClickupToCreateTaskComment, IRequestClickupCreateTaskComment, IRequestClickupCreateTask, requestClickupToCreateTask, requestClickupToUpdateTask } from '../clickup/model'
import { IRequestMyroCompnayCreateTask } from "../task/model"
import { create } from "../task/create"
import { findMyroTaskById } from '../task/find';
import { updateTaskStatus } from '../task/update';


export type IWebhookFromDooray = {
	webhookType?: string, //'postWorkflowChanged',
	tenant?: {
		id?: string, //'2393445616658000086' 
	},
	hookEventType?: string, //'postWorkflowChanged',
	version?: string | number, //2,
	project?: {
		id?: string, //'2531758068456824356',
		code?: string, //'미로--개발--이슈관리(통합)'
	},
	source?: {
		type?: string, //'member',
		member?: {
			id?: string, //'2393591811207727931',
			name?: string, //'이찬린',
			userCode?: string, //'charlie',
			emailAddress?: string, //'charlie@lastorder.co.kr'
		}
	},
	body?: {
		mimeType?: string,
		content?: string,
		emptyContent: boolean
	}
	comment?:{
		id?: string,
		subtype?: string,
		body? : {
			mimeType?: string,
			content?: string,
			emptyContent?: boolean,
		},
	}
	workflow : {
		names?: [],
		id?: string,
		class?: string
	}
	post: {
		createdAt?: string,
		dueDate?: null | string,
		dueDateFlag?: true,
		updatedAt?: string,
		priority?: string,
		parent?: {
			//   id: null,
			//   number: null,
			//   subject: null,
			//   dueDate: null,
			//   dueDateFlag: null,
			//   workflowClass: null
		},
		body?: {
			mimeType?: string,
			content?: string,
			emptyContent?: boolean,
		},
		users?: {
			// from: [Object], 
			// to: [], 
			// cc: [], 
			// me: [Object] 
		},
		tags?: null,
		id?: string,
		subject?: string,
		number?: number,
		workflow?: {
			names?: [], // [ [Object], [Object], [Object], [Object] ],
			id?: string, //'2531758068756986294',
			class?: string, //'working'
		}
	}
}


// 두레이 요청 Interface
export type IRequestDoorayCreateTask = {
	parentPostId?: string,
	users?: {},
	subject?: string,
	body?: {},
	status?: string,
	dueDate?: Date,
	dueDateFlag?: boolean,
	milestoneId?: string,
	tagIds?: [],
	priority?: string
}


export type IRequestDoorayUpdateTask = {
	name: string
}


// DoorayWorkId 상태: ex)요청, 진행중, 완료) 변경 
export const requestDoorayUpdateWorkId = async(projectId: string, postId: string, apiKey: string, workflowId: any) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/posts/${postId}/set-workflow`
	const doorayApiKey = apiKey ? apiKey : process.env.DOORAY_API_KEY
	const param = { 'workflowId' : workflowId }
	return await axios.post(url, param, {
		headers: {
			"Authorization": doorayApiKey,
			"Content-Type": "application/json"
		},
	});
}

//DoorayWorkId 상태 ex)요청, 진행중, 완료) 정보 얻어오기
export const requestDoorayGetWorkId = async(projectId: string) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/workflows`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

export const requestDoorayGetProjectMember = async(projectId: string) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/members/`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

export const requestDoorayGetMember = async() => {
	const url = `https://api.dooray.com/common/v1/members?userCode=oktopkoo`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

//DoorayProject 정보 얻어오기
export const requestDoorayGetProject = async(projectId: string) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

//Dooray프로젝트 Task 전체 얻어오기
export const requestDoorayGetAllTask = async(projectId: string) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/posts?size=100`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

//DoorayTask 정보 얻어오기
export const requestDoorayGetTask = async(projectId: string, postId: string) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/posts/${postId}`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	}).catch((err)=>{
		console.log(err)
	});
}

export const requestDoorayGetTag = async(projectId: string, tagId: string) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/tags/${tagId}`
	return await axios.get(url, {
		headers: {
			"Authorization": process.env.DOORAY_API_KEY,
			"Content-Type": "application/json"
		},
	})
}

export const requestDoorayToCreateTaskComment = async (projectId: string, postId: string, apiKey: string, param: IRequestDoorayCreateTask) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/posts/${postId}/logs`;
	const doorayApiKey = apiKey ? apiKey : process.env.DOORAY_API_KEY
	return await axios.post(url, param, {
		headers: {
			"Authorization": doorayApiKey,
			"Content-Type": "application/json"
		},
	});
}

export const requestDoorayToCreateTask = async (projectId: string, apiKey: string, param: IRequestDoorayCreateTask) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/posts`;
	const doorayApiKey = apiKey ? apiKey : process.env.DOORAY_API_KEY
	return await axios.post(url, param, {
		headers: {
			"Authorization": doorayApiKey,
			"Content-Type": "application/json"
		},
	});
}


export const requestDoorayToUpdateTask = async (projectId: string, postId: string, apiKey: string,  param: IRequestDoorayCreateTask) => {
	const url = `https://api.dooray.com/project/v1/projects/${projectId}/posts/${postId}`;
	const doorayApiKey = apiKey ? apiKey : process.env.DOORAY_API_KEY
	return await axios.put(url, param, {
		headers: {
			"Authorization": doorayApiKey,
			"Content-Type": "application/json"
		},
	});
}



export const getDoorayDescription = (data: IWebhookFromDooray) => {
	const url = "https://myrocompany.dooray.com/project/posts/" + data.post.id
	const descrition =	url + 
						"\n" + data.post.body.content
	return descrition
}


export const getDoorayPostId = (taskData: any, postId: string) => {
	let data = taskData.data.custom_fields

	for(let obj of data){
		if(obj.id==postId){
			return obj.value
		}
	}
}

export const getDoorayWorkFlowId = (doorayWebHook: IWebhookFromDooray) => {
	let data = doorayWebHook.workflow.names
	console.log(doorayWebHook.workflow)
	console.log(data)
	for(let obj of data){
		if(obj.locale=="ko_KR"){
			return obj.name
		}
	}
}

export const postCreated = async (doorayWebhook: IWebhookFromDooray) => {		//Json Parse Check
	const clickupContent = isJson(doorayWebhook.post.body.content) ? JSON.parse(doorayWebhook.post.body.content) : ""
	const postId = "f7242db7-4ff4-4400-85d8-14b21dd03890"
	const customFields: any = [ { id : postId, value: doorayWebhook.post.id  } ]

	if(clickupContent){
		doorayWebhook.post.body.content = " "
		await requestClickupToDeleteTask(clickupContent.id)
		console.log("ClickupTask Delete Complete")
	}
	
	const tag = clickupContent.tag ? [ clickupContent.tag ] : []
	const description = getDoorayDescription(doorayWebhook) ? getDoorayDescription(doorayWebhook) : " "
	const member = clickupContent.member ? findListByMemberId(clickupContent.member) : findListByMemberId(doorayWebhook.source.member.id)
	const priority = findListByPriorityrId(doorayWebhook.post.priority) ? findListByPriorityrId(doorayWebhook.post.priority) : "none"
	const listNumber = findListByProjectId(doorayWebhook.project.id);
	let status;

	if(listNumber=="28922731"){
		status = "배포 계획/버저닝"
	} else {
		status = "TO DO"
	}

	let request: IRequestClickupCreateTask =  member ? {
		name: doorayWebhook.post.subject,
		description: description,
		assignees: [ member ],
		tags: tag,
		status: status,
		priority: priority,
		check_required_custom_fields: true,
		custom_fields: customFields
	} : {
		name: doorayWebhook.post.subject,
		description: description,
		tags: tag,
		status: status,
		priority: priority,
		check_required_custom_fields: true,
		custom_fields: customFields
	}

	console.log(request)

	await requestClickupToCreateTask(listNumber, request)
		.then(res => {
			console.log("=================>1", res.data);
		})
		.catch(err => {
			console.log("=================>2", err);
		});
	
	let requestDynamo: IRequestMyroCompnayCreateTask = {
		id 			: doorayWebhook.post.id,
		taskId		: "none",
		taskTitle 	: doorayWebhook.post.subject,
		taskStatus  : status, 
	}

	await create(requestDynamo)
	.then(res => {
		console.log("Sucess request DynamoDB Task", res)
	}).catch(error => {
		console.log("Fail request DynamoDB Task", error)
	});

}

export const postCommentCreated = async (doorayWebHook: IWebhookFromDooray) => {
	if(doorayWebHook.comment.body.content.lastIndexOf('From Dooray')==-1 && doorayWebHook.comment.body.content.lastIndexOf('From Clickup')==-1){

		const task = await findMyroTaskById(doorayWebHook.post.id)
		const taskId = task.taskId
		const comment = doorayWebHook.comment.body.content ? doorayWebHook.comment.body.content : " "

		let request: IRequestClickupCreateTaskComment = {
			comment_text: comment + "\n\n" + "From Dooray",
			notify_all: true
		}

		if (taskId){
			await requestClickupToCreateTaskComment(taskId, request)
			.then(res => {
				console.log("=================>1", res.data);
			})
			.catch(err => {
				console.log("=================>2", err);
			});
		} else console.log("taskID is not exist DynamoDB")

	} else {
		console.log("This Comment is exist")
	}
	
}

export const postWorkflowChanged = async (doorayWebHook: IWebhookFromDooray) => {
	const task = await findMyroTaskById(doorayWebHook.post.id)
	console.log(task)
	const workFlowName = getDoorayWorkFlowId(doorayWebHook)
	const clickupwWorkFlowName   = findListByClickupWorkFlowId(workFlowName)
						

	const workFlowId = findListByWorkFlowId(clickupwWorkFlowName)
	console.log(workFlowName, clickupwWorkFlowName, workFlowId, task.taskStatus)

	if(workFlowId===task.taskStatus){
		console.log("DynamoDB Status does not update ")
	
	} else {	
		let request: IRequestClickupCreateTask = { status : clickupwWorkFlowName }
		
		await requestClickupToUpdateTask(task.taskId, request)
		.then(res => {
			console.log("=================>1", res.data);
		})
		.catch(err => {
			console.log("=================>2", err);
		});

		await updateTaskStatus(workFlowId, doorayWebHook.post.id)

		.then(res => {
			console.log(res, "Success: update DynamoDB Task Status ")
		}).catch(err => {
			console.log(err)
		})
	}

}

export const dooraySyncTask =  async (doorayWebhook: IWebhookFromDooray) => {
	
	switch(doorayWebhook.webhookType){
		case "postCreated":
			await postCreated(doorayWebhook)
			break;
		case "postCommentCreated":
			await postCommentCreated(doorayWebhook)
			break;
		case "postWorkflowChanged":
			await postWorkflowChanged(doorayWebhook)
			break;
	}
}