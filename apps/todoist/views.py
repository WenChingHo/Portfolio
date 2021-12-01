from django.shortcuts import render
from todoist.api import TodoistAPI
from datetime import datetime
from django.views import View
from django.http import Http404
from django.http import JsonResponse

import calendar

# Create your views here.
def index(request):
    return render(request, 'todoist/index.html')

class API(View):
    def get(self, request, todoistApi, month, year): 
        todoistApi = TodoistAPI(todoistApi) 
        month = int(month)+1
        if "error_code" in todoistApi.sync().keys():
            JsonResponse({"user":todoistApi.state.get("user"), 
                "tasks" :[], 
                "completed": []})
        # Get Tasks
        items = []

        for i in todoistApi.state["items"]:

            if i["due"] and i["due"].get("date")[5:7] == str(month) and i["due"].get("date")[:4] == year and i["checked"]==0:
                items.append({
                    "content":i["content"],
                    "due": i["due"].get("date"),
                    "description": i["description"],
                    "id" :0,
                    "type": "task"
                })
                #strDate = i["due"].get("date") + "T00:00:00" if len(i["due"].get("date")) ==10 else i["due"].get("date")
                #date = datetime.strptime( strDate, "%Y-%m-%dT%H:%M:%S")

        # Get Completed Tasks
        today = datetime.now()
        _ , daysInMonth = calendar.monthrange(today.year, month)

        completed_tasks = todoistApi.completed.get_all(
            since=f'{today.year}-{str(month).zfill(2)}-01T00:00',
            until=f'{today.year}-{str(month).zfill(2)}-{daysInMonth}T00:00'
            )['items']

        for item in completed_tasks: 
            item['type']='completed'
            item["due"] = item.pop("completed_date")
        print({"user":todoistApi.state.get("user"), 
                "tasks" :items, 
                "completed": completed_tasks})
        return JsonResponse({"user":todoistApi.state.get("user"), 
                "tasks" :items, 
                "completed": completed_tasks})

    def post(self):
        pass


