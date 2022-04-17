

// projectId with ListId pair
export const pareDoorayProjectByClickupList = {

}

export const pareDoorayWorkFlowByClickupList = {
	
}

export const pareClickupWorkFlowByDoorayList = {
	"요청" 					 : "to do",
	"진행 중" 				 : "in progress",
	"테스팅" 				 : "deployed - dev",
	"완료(배포전)"			  : "deployed - dev",
	"완료(배포)" 			  : "done",
	"보류" 					 : "hold",
	"Dropped" 				: "droped"
}

export const pareDoorayMemberByClickupList = {
	 "7823814" : "3046321719599858766",			// 윤기용

}




 /* hightest, high, normal, low, lowest, none */
export const pareDoorayPriorityClickupList = {
	1 : "hightest",
	2 : "high",
	3 : "normal",
	4 : "low",
}

export const pareDoorayTagByClickupList = {

}


export const DoorayTagList = {

}


export const findListByClickupWorkFlowId = (workflowName: any) => {
	for (let [key, value] of Object.entries(pareClickupWorkFlowByDoorayList)) {
		if (workflowName == key) {
			return value;
		} else if (workflowName == value){
			return key;
		}
	}
}

export const findListByPriorityrId = (priorityId: any) => {
	for (let [key, value] of Object.entries(pareDoorayPriorityClickupList)) {
		if (priorityId == key) {
			return value;
		} else if (priorityId == value){
			return key;
		}
	}
}



export const findListByMemberId = (memberId: string) => {
	for (let [key, value] of Object.entries(pareDoorayMemberByClickupList)) {
		if (memberId == key) {
			return value;
		} else if (memberId == value){
			return key;
		}
	}
}

export const isJson = (str: string) => {
	try {
		var json = JSON.parse(str);
		return (typeof json =='object')
	} catch (e){
		return false
	}
}


export const findListByTagId = (tagId: string) => {
	for (let [key, value] of Object.entries(pareDoorayTagByClickupList)) {
		if (tagId == key) {
			return value;
		} else if (tagId == value){
			return key;
		}
	}
}

export const findListByProjectId = (projectId: string) => {
	for (let [key, value] of Object.entries(pareDoorayProjectByClickupList)) {
		if (projectId == key) {
			return value;
		} else if (projectId == value){
			return key;
		}
	}
}

export const findListByWorkFlowId = (workFlowId: string) => {
	for (let [key, value] of Object.entries(pareDoorayWorkFlowByClickupList)) {
		if (workFlowId === key) {
			return value;
		} else if (workFlowId == value){
			return key;
		}
	}
}


export const findProjectIdByListId = (listId: string) => {
	return Object.values(pareDoorayProjectByClickupList).find(key => pareDoorayProjectByClickupList[key] === listId);
}


export const sleep = async (ms: number) =>{
	return await new Promise((resolve) => {
		setTimeout(resolve, ms);
	  });
}
