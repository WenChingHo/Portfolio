class SideBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentTab: 0,
            isModalOpen: false,
            tabName: "Login",
            username: "Guest"
        }
        this.SIDEBAR_CONTENT = ["Login", "Reserved", "Reserved", "Reserved"]
        this.tabsOnclickHandler = this.tabsOnclickHandler.bind(this)
    }
    tabsOnclickHandler(e) {
        this.setState({
            isModalOpen: true,
            currentTab: e.target.id,
            tabName: e.target.outerText.replace(" ", "_")
        })
    }
    static getDerivedStateFromProps(props, cur_state) {
        if (cur_state.username !== props.username) {
            return {
                username: props.username
            }
        }
        return null
    }

    handleModalClose = event => {
        // console.log('handleModalOpen: ', event);
        this.setState({
            isModalOpen: false,
        })
    }

    render() {
        const sidebarTabs = this.SIDEBAR_CONTENT.map((tab, i) => (
            <div key={i}>
                <div
                    id={i + "_tab"}
                    className="tabs"
                    onClick={this.tabsOnclickHandler}
                > {tab}
                </div>
            </div>
        ))

        return (
            <div className="sidebar">
                <ReactModalTemplate {...this.props} state={this.state} CB={this.handleModalClose} APITokenCB={this.props.APITokenCB} />

                <div className="avatar">
                    <div className="avatar__img">
                        <img src="https://picsum.photos/70" alt="avatar" ></img>
                    </div>
                </div>
                <div className="avatar__name">{this.state.username}</div>
                {sidebarTabs}
            </div>
        )
    }
}
class ReactModalTemplate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.MODALLIST = this.updateModalList()
    }

    static getDerivedStateFromProps(props, cur_state) {
        if (cur_state.APIToken !== props.APIToken) {
            return {
                APIToken: props.APIToken
            }
        }
        return null
    }

    updateModalList = () =>{
        this.MODALLIST = [
            <LoginModal {...this.state} {...this.props.state} APITokenCB={this.props.APITokenCB} />,
            <CaldendarModal />,
            <CreateTaskModal />,
            <TaskModal />
        ]
    }

    render() {
        this.updateModalList()
        const contentToLoad = this.MODALLIST[parseInt(this.props.state.currentTab)]
        return (
            <ReactModal
                id={this.props.state.tabName}
                style={contentToLoad}
                isOpen={this.props.state.isModalOpen}
                onRequestClose={this.props.CB}
                preventScroll={true}
            >
                <div onClick={this.props.CB} id="modalClose" aria-hidden="true">&times;</div>
                <div>{contentToLoad}</div>
            </ReactModal>

        )
    }
}

class LoginUserList extends React.Component {
    constructor(props) {
        super(props)
        this.UNWANTED_ENTRIES = ["graphiql:operationName", "ally-supports-cache"]
    }

    onChangeHandler = (e) => {
        var APItoken = localStorage.getItem(e.target.value)
        this.props.APITokenCB(APItoken)
    }
    render() {
        var entries = Object.entries(localStorage).map(([key, _], i) => (
            !this.UNWANTED_ENTRIES.includes(key) && <option key={i} value={key}>{key}</option>
        ))

        console.log("user",this.props.username)
        return (
            <select value={this.props.username} onChange={this.onChangeHandler} name="users" id="users">
                <option key="-1" value="Guest">Guest</option>
                {entries}
            </select>
        )
    }
}

class LoginModal extends React.Component {
    render() {
        return (
            <div>
                <p className="modalTitles">Connect to Todoist</p>
                <hr />
                <p className="smallIndent">Currently Connected As:</p>
                <div className="avatar">
                    <div className="avatar__img">
                        <img src="https://picsum.photos/70" alt="avatar" ></img>
                    </div>
                </div><br />

                <div id="loginUsername" >
                    <LoginUserList {...this.props} APITokenCB={this.props.APITokenCB}/>
                    <div className="smallIndent"> {this.props.APIToken === 0 ? "" : this.props.APIToken}</div>
                </div><br /><br />

                <label htmlFor="APIToken">Enter your Todoist API token to add new user:</label><br />
                <input type="text" id="APIToken" name="APIToken" /><br /><br />
                <button onClick={() => this.props.APITokenCB(document.getElementById("APIToken").value)}>submit</button>

            </div>

        )


    }
}

class CaldendarModal extends React.Component {
    render() {
        return (<p>CaldendarModal</p>)

    }
}
class CreateTaskModal extends React.Component {
    render() {
        return (<p>CreateTaskModal</p>)


    }
}
class TaskModal extends React.Component {
    render() {
        return (<p>TaskModal</p>)
    }
}
class CalendarFunctionBar extends React.Component {
    constructor(props) {
        super(props)
    }

    onClickHandler = (e) => {
        var data = this.props
        if (e.target.id === "prevMonth") {
            data.month === 0 ?
                data.getMonthCB(data.year - 1, 11, data.day) :
                data.getMonthCB(data.year, data.month - 1, data.day)
        }
        else {
            data.month === 11 ?
                data.getMonthCB(data.year + 1, 0, data.day) :
                data.getMonthCB(data.year, data.month + 1, data.day)
        }
    }

    render() {
        var months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var monthName = months[this.props.month]
        return (
            <div id="calendar_month" className="current-month">
                <button onClick={this.onClickHandler} style={{ left: "40%" }} id="prevMonth" className="calendarButton" >&#60;&nbsp;</button>
                <strong id="calendarHeader">{monthName + " " + this.props.year}</strong>
                <button onClick={this.onClickHandler} style={{ left: "65%" }} id="nextMonth" className="calendarButton" > &nbsp;&#62;</button>
            </div>
        )
    }
}

class CalendarContents extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            cellIndexSelected: -1,
            dateSelected: -1
        }
    }

    selectDateHandler = (day, id) => {
        this.setState((prevState) => ({
            cellIndexSelected: prevState.cellIndexSelected === id ? -99 : id,
            dateSelected: prevState.dateSelected === day ? -99 : day,
            tasks: "",
            completed: ""
        }))
    }

    static getDerivedStateFromProps(props, cur_state) {
        //Sort the tasks/completed task chronologically
        if (props.tasks !== cur_state.tasks) {
            for (const [key, _] of Object.entries(props.tasks)) {
                props.tasks[key] = props.tasks[key].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
            }
            for (const [key, _] of Object.entries(props.completed)) {
                props.completed[key] = props.completed[key].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
            }
            return ({
                tasks: props.tasks,
                completed: props.completed
            })
        }
    }

    render() {
        const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        const weekdayHeaders = weekdays.map((day, i) => (
            <div key={"weekday_" + i}>{day}</div>
        ))
        return (
            <div className="calendar">
                <div className="calendar__header">
                    {weekdayHeaders}
                </div>
                <CalendarCells
                    dayInMonth={this.props.dayInMonth}
                    monthStartWeekDay={this.props.monthStartWeekDay}
                    tasks={this.state.tasks}
                    completed={this.state.completed}
                    cellIndexSelected={this.state.cellIndexSelected}
                    selectNewDateCB={this.selectDateHandler}
                />
                <TaskTimeline
                    tasks={this.state.tasks}
                    completed={this.state.completed}
                    dateSelected={this.state.dateSelected}
                    month={this.props.month}
                    user={this.props.username}
                />
            </div>
        )
    }
}


class TaskTimeline extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {

        let selectedCell = document.getElementById(`day_${this.props.dateSelected}`) || null
        let position;

        if (selectedCell) {
            position = selectedCell && selectedCell.getBoundingClientRect()
        }
        var todayTask = this.props.tasks[this.props.dateSelected]
        var todayComplete = this.props.completed[this.props.dateSelected]
        return (
            <div style={ selectedCell !=null ? { //Show when selected and if not "Guest"
                left: position.x + position.width / 2 >= document.body.clientWidth - 650 ? position.x - position.width / 2 - 580 : position.x + position.width / 2-250,
                bottom: position.y+30
            } : { display: "none" }} className="timeline">
                <div className="box">
                    <div className="container">
                        <div className="lines">
                            {todayComplete && todayComplete.map((task, i) => <DrawLines id={i} task={task} type={"complete"} />)}
                            {todayTask && todayTask.map((task, i) => <DrawLines id={i} task={task} />)}
                            <div style={{ background: "white", border: "1px solid grey" }} className="dot"></div>
                        </div>
                        <div className="cards">
                            <DrawCards tasks={todayComplete} type="complete" />
                            <DrawCards tasks={todayTask}  type="task"/>
                            <div className="card">
                                <h4>Add Task?</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
function DrawCards(props) {
    return (
        props.tasks ?
            props.tasks.map((task, i) => {
                return (
                    <div key={i} className="card">
                        <i className="float fa fa-trash-o"></i>
                        <i className={"float fa " + (props.type==="complete"? "fa-undo" :"fa-check")}></i>
                        <h4>{task.content}</h4>
                        <p>{task.description}</p>
                    </div>
                )
            }) : ""
    )
}
function DrawLines(props) {
    console.log(props)
    return (
        <div key={props.id}>
            <div className={props.type === "complete" ? "cdot dot" : "dot"}></div>
            <p className="floatingTime">{props.task["due"].slice(11, 16)}</p>
            <div className="line"></div>
        </div>
    )
}
class CalendarCells extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            tasks: []
        }
    }

    static getDerivedStateFromProps(props, cur_state) {
        if (cur_state.tasks !== props.tasks) {
            return {
                tasks: props.tasks
            }
        }
        return null
    }
    onDropHandler = (e) => {
        e.preventDefault()
        console.log(this.props)
        console.log(e.target.id)
    }
    onDragOver(e) {
        e.preventDefault()

    }

    onClickHandler(day, i) {
        day = this.props.dayInMonth === -1 ? day : day + 1
        this.props.selectNewDateCB(day, i)
    }
    drawCalendarTable() {
        let range = n => [...Array(n).keys()]
        let dayCell = range(this.props.dayInMonth)

        if (this.props.monthStartWeekDay >= 0) {
            let frontEmptyCell = new Array(this.props.monthStartWeekDay).fill(-1)
            dayCell = frontEmptyCell.concat(dayCell)
        }
        if (dayCell.length % 7 !== 0) { //empty cell after last day of month
            let backEmptyCell = new Array(7 - dayCell.length % 7).fill(-1)
            dayCell = dayCell.concat(backEmptyCell)
        }

        return dayCell.map((day, i) => (
            <div onClick={() => this.onClickHandler(day, i)}
                onDrop={this.onDropHandler}
                onDragOver={this.onDragOver}
                key={"day_" + i}
                id={"day_" + (day === -1 ? " " : day + 1)}
                className={"calendar__day day" + (i === this.props.cellIndexSelected ? " selected" : "")}>
                <p>{day === -1 ? " " : day + 1}</p>
                <DottedTasks day={day + 1} tasks={this.props.tasks[day + 1]} completed={this.props.completed[day + 1]} />
            </div>
        ))
    }

    render() {
        const dayCells = this.drawCalendarTable()
        return (
            <div className="calendar__week">
                {dayCells}
            </div>)
    }
}


class DottedTasks extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            left: 0,
            top: 0,
            selectedTodo: -1,
            selectedCompleted: -1
        }
    }

    onMouseEnterHandler = (e, i) => {
        var classname = e.target.className
        console.log(e.nativeEvent.clientX)
        this.setState({
            top: e.target.offsetTop,
            left: e.nativeEvent.clientX,
            selectedTodo: classname[0] === "t" ? i : -1,
            selectedCompleted: classname[0] === "c" ? i : -1
        })
    }
    onMouseLeaveHandler = (e) => {
        this.setState({
            selectedTodo: -1,
            selectedCompleted: -1
        })
    }
    render() {
        console.log(this.props.completed)
        return (
            <div>
                <div className="taskDots">
                    {this.props.completed ? this.props.completed.map((task, i) => {
                        return (
                            <div
                                onMouseEnter={(e) => this.onMouseEnterHandler(e, i)}
                                onMouseLeave={this.onMouseLeaveHandler}
                                className={"completedDots " + this.props.day + "DotDay"}>●
                                <div
                                    key={i}
                                    style={{ top: this.state.top + 30, left: this.state.left }}
                                    className={"todoDotsDescription" + (this.state.selectedCompleted === i ? " show" : "")}>
                                    <p className="dotTitle">{task.content}</p>
                                    <p>{"Finished on: " + task["due"].slice(11, 16)}</p>
                                </div>
                            </div>
                        )
                    }) : <div className="completedDots"></div>}
                </div>
                <div className="taskDots">
                    {this.props.tasks && this.props.tasks.map((task, i) => {
                        return (
                            <div
                                onMouseEnter={(e) => this.onMouseEnterHandler(e, i)}
                                onMouseLeave={this.onMouseLeaveHandler}
                                className={"todoDots " + this.props.day + "DotDay"}>●
                                <div
                                    key={i}
                                    style={{ top: this.state.top + 30, left: this.state.left }}
                                    className={"todoDotsDescription" + (this.state.selectedTodo === i ? " show" : "")}>
                                    <p class="dotTitle">{task.content}</p>
                                    <p>{task["due"].slice(11, 16) || "No scheduled Time"}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}
var DEFAULT_TASKS = {'user': {'auto_reminder': 30, 'business_account_id': null, 'daily_goal': 5, 'date_format': 0, 'dateist_inline_disabled': false, 'dateist_lang': null, 'days_off': [6, 7], 'default_reminder': 'email', 'email': '8ky9nds74g@privaterelay.appleid.com', 'features': {'beta': 0, 'dateist_inline_disabled': false, 'dateist_lang': null, 'has_push_reminders': true, 'karma_disabled': false, 'karma_vacation': false, 'restriction': 0}, 'full_name': 'Edward Ho', 'id': 35533031, 'image_id': null, 'inbox_project': 2273602810, 'is_biz_admin': false, 'is_premium': false, 'join_date': '2021-09-13T02:41:34Z', 'karma': 3990.0, 'karma_trend': 'up', 'lang': 'en', 'mobile_host': null, 'mobile_number': null, 'next_week': 1, 'premium_until': null, 'share_limit': 25, 'sort_order': 0, 'start_day': 1, 'start_page': 'overdue, today', 'theme': 11, 'time_format': 0, 'token': 'a51b335beebba7e156b26408b85a86c7c93b0016', 'tz_info': {'gmt_string': '+08:00', 'hours': 8, 'is_dst': 0, 'minutes': 0, 'timezone': 'Asia/Taipei'}, 'unique_prefix': 5, 'websocket_url': 'wss://ws.todoist.com/ws?token=MmQ2ODBmNjRiMWJlOTNhNVhIpYob0kEGEta_uRTrJ2Y', 'weekly_goal': 30}, 'tasks': [{'content': '30 min typeracer', 'due': '2021-11-16', 'description': '[TypeRacer - the global typing competition](https://play.typeracer.com/)', 'id': 0, 'type': 'task'}, {'content': 'Calendar App: Implement add and delete', 'due': '2021-11-03', 'description': '', 'id': 0, 'type': 'task'}, {'content': 'Leetcode x2', 'due': '2021-11-20', 'description': '', 'id': 0, 'type': 'task'}, {'content': 'Startup research', 'due': '2021-11-29', 'description': '', 'id': 0, 'type': 'task'}, {'content': 'Apply 5 jobs', 'due': '2021-11-30', 'description': '', 'id': 0, 'type': 'task'}], 'completed': [{'content': 'Apply 5 jobs', 'id': 4956213263, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5341817417, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-29T13:45:35Z'}, {'content': 'check:', 'id': 4956213068, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5307984231, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-29T13:45:31Z'}, {'content': 'Apply 5 jobs', 'id': 4953761008, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5341817417, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:42:16Z'}, {'content': 'Udemy Web Dev Section 1-3', 'id': 4953760897, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5367989607, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:42:10Z'}, {'content': 'DJ4E Course 3 Week 5', 'id': 4953759905, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5367988192, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:41:38Z'}, {'content': 'check:', 'id': 4953759676, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5307984231, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:41:31Z'}, {'content': 'reserve for lunch', 'id': 4953758760, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5361345074, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:41:00Z'}, {'content': 'Startup research', 'id': 4953758672, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334158867, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:40:56Z'}, {'content': 'Exam', 'id': 4953758601, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5345097042, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-28T14:40:53Z'}, {'content': 'Leetcode x2', 'id': 4933280341, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334158003, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-19T12:11:42Z'}, {'content': 'Startup research', 'id': 4933280327, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334158867, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-19T12:11:42Z'}, {'content': 'Message freelancer', 'id': 4933280390, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5344338110, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-19T12:11:41Z'}, {'content': 'Apply 5 jobs', 'id': 4933280275, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5341817417, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-19T12:11:40Z'}, {'content': 'check:', 'id': 4931114113, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5307984231, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-18T15:17:30Z'}, {'content': 'Leetcode x2', 'id': 4931114097, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334158003, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-18T15:17:29Z'}, {'content': 'Apply 5 jobs', 'id': 4931114022, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5341817417, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-18T15:17:27Z'}, {'content': 'Startup research', 'id': 4931112853, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334158867, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-18T15:17:01Z'}, {'content': 'Apply 5 jobs', 'id': 4924940309, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5333515263, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-16T10:01:16Z'}, {'content': 'Startup research', 'id': 4924826578, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334158867, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-16T09:02:45Z'}, {'content': 'Django for everyone W2', 'id': 4924823252, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334153750, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-16T09:00:58Z'}, {'content': 'Django for everyone W1', 'id': 4924823175, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5334153316, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-16T09:00:56Z'}, {'content': '30 min typeracer', 'id': 4922388559, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5228014792, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-15T12:58:41Z'}, {'content': 'apply 5 jobs', 'id': 4922388655, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5331401211, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-15T12:58:40Z'}, {'content': 'Update Resume', 'id': 4922388543, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5331170553, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-15T12:58:37Z'}, {'content': '30 min typeracer', 'id': 4919584246, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5228014792, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-14T08:06:37Z'}, {'content': '新創圓夢網 寄企劃書草稿', 'id': 4908464948, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5311640110, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-09T15:32:13Z'}, {'content': '30 min typeracer', 'id': 4908464029, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5228014792, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-09T15:31:54Z'}, {'content': 'Lean Business Model v1', 'id': 4908358705, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5314637600, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-09T14:55:09Z'}, {'content': 'AMEX payment', 'id': 4908358598, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5314634218, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-09T14:55:07Z'}, {'content': 'Fix Resume', 'id': 4905821168, 'meta_data': null, 'project_id': 2273602810, 'task_id': 5306043618, 'user_id': 35533031, 'type': 'completed', 'due': '2021-11-08T17:02:00Z'}]}
class Calendar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            APIToken: document.cookie || 0,
            username: "Guest",
            tasks: "",
            completed: ""
        };
        this.getMonthDetail = this.getMonthDetail.bind(this)
    }

    componentDidMount() { //Initial render
        var date = new Date()
        this.getMonthDetail(date.getFullYear(), date.getMonth(), date.getDate())
    }

    getMonthDetail(year, month, day) {
        this.setState({
            year: year,
            month: month,
            day: day,
            tasks: this.memoizeTasks(DEFAULT_TASKS.tasks),
            completed: this.memoizeTasks(DEFAULT_TASKS.completed),
            monthStartWeekDay: new Date(`${year}-${month + 1}-01`).getDay() - 1,
            dayInMonth: new Date(year, month, 0).getDate(),
        })
        if (this.state.username !=="Guest")
        this.state.APIToken && this.fetchMonthlyData(this.state.APIToken, month, year)
    }

    fetchMonthlyData = (APItoken, month, year) => {
        this.setState({
            dataLoaded: false
        })
        return fetch(`/todoist/api/${APItoken}/${month}/${year}`) //Else connect via APItoken
            .then(res => res.json())
            .then((res) => {
                localStorage.setItem(res.user.full_name, APItoken)
                document.cookie = APItoken
                this.setState({
                    APIToken: APItoken,
                    username: res.user.full_name,
                    tasks: this.memoizeTasks(res.tasks) || [],
                    completed: this.memoizeTasks(res.completed) || [],
                    dataLoaded: true
                })
            })
    }
    memoizeTasks = (tasks) => {
        var tasksTable = {}

        for (var i of tasks) {
            var date = i["due"].slice(8, 10)
            date = date.replace(/^0+/, '')
            tasksTable[date] === undefined ?
                tasksTable[date] = [i] : tasksTable[date].push(i)
        }
        return tasksTable
    }

    updateAPIToken = (APItoken) => {
        !APItoken ? (() => {
            this.setState({  //Logout to guest
                APIToken: 0,
                username: "Guest",
                tasks: "",
                completed: "",
                dataLoaded: false,
            })
            alert("You're now browsing as Guest")
        })(this)
            :
            this.fetchMonthlyData(APItoken, this.state.month, this.state.year)
                .then(() => alert(`Welcome, ${this.state.username}! The connection was successful`))
                .catch(err => alert(err, "Something went wrong.\nPlease Check if your API key was correct"))
    }

    render() {
        return (
            <html>
                <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
                </head>
                <div className="container-fluid">

                    <div className="row">
                        <div className="col-lg-2">
                            <SideBar APITokenCB={this.updateAPIToken} {...this.state} />
                        </div>
                        <div className="col-lg-9">
                            {
                                this.state.dataLoaded || this.state.username === "Guest" ?
                                    <div>
                                        <CalendarFunctionBar {...this.state} getMonthCB={this.getMonthDetail} />
                                        <CalendarContents {...this.state} />
                                    </div> :
                                    <div>loading</div>
                            }
                        </div>
                        <div className="col-lg-1">
                        </div>
                    </div>
                </div>
            </html>
        )
    }
}


class App extends React.Component {
    render() {
        return (
            <Calendar />
        )
    }
}



ReactDOM.render(<App />, document.getElementById('app'))