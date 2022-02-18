import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NetworkService, ProjectService, statusType, ToastService } from '../../core';
import { actions } from '../../core/constants/actions.constants';
import { urlConstants } from '../../core/constants/urlConstants';
import { RouterLinks } from '@app/app/app.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../../core/services/db.service';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { UnnatiDataService } from '../../core/services/unnati-data.service';
import { UtilsService } from "../../core/services/utils.service";
import * as _ from "underscore";
import {subtaskStatus, statuses} from '../../core/constants/statuses.constant';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.page.html',
  styleUrls: ['./task-details.page.scss'],
})
export class TaskDetailsPage implements OnInit {
  projectId;
  solutionId;
  programId
  templateId;
  projectType;
  _headerConfig;
  allStrings;
  taskDetails;
  categories = [];
  isNotSynced: boolean;
  cardMetaData;
  taskActions;
  segmentType = "details";
  networkFlag: boolean;
  private _networkSubscription: Subscription;
  shareTaskId
  _appHeaderSubscription: Subscription;
  taskCompletionPercent;
  allStatusTypes = statusType;
  parameters;
  newSubtask: any = {};
  project;
  projectCopy;
  task;
  enableMarkButton: boolean = false;
  attachments = [];
  subTaskCount: number = 0;
  projectTitle;
  taskProgress;
  subtaskCount: number = 0;
  sortedSubtasks;
  stateData;
  // id;
  buttonLabel = 'FRMELEMNTS_LBL_START_IMPROVEMENT';
  statuses = statuses;

  constructor(
    public params: ActivatedRoute,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private db: DbService,
    private network: NetworkService,
    private toast: ToastService,
    private router: Router,
    private alert: AlertController,
    private ref: ChangeDetectorRef,
    private unnatiService: UnnatiDataService,
    private projectServ: ProjectService,
    private utils: UtilsService,
  ) {
    // this.saveChanges = _.debounce(this.saveChanges, 800);
    // this.saveSubTaskChanges = _.debounce(this.saveSubTaskChanges, 800);
    params.params.subscribe((parameters) => {
      this.parameters = parameters;
      this.getTask();
      this.prepareSubTaskMeta();
    });

    // this.id = this.parameters.id

    params.queryParams.subscribe(projRes => {
      this.projectTitle = projRes.projectTitle
    })

    this.stateData = this.router.getCurrentNavigation().extras.state;
  }

  templateDetailsInit() {
    switch (this.stateData?.referenceFrom) {
      // case 'observation':
      //   this.templateId = this.id;
      //   this.getTemplateByExternalId();
      //   break
      case 'link':
        this.getTaskApi();
        break
      default:
        this.getTaskApi();
    }
  }

  ngOnInit() {}

  /**
   * this method is called every time the view is navigated to (regardless if initialized or not),
   * it's a good method to load data from services.
   */
   ionViewWillEnter() {
    this.templateDetailsInit();
  }

  // getProject() {
  //   if (this.projectId) {
  //     this.db.query({ _id: this.projectId }).then(
  //       (success) => {
  //         if (success.docs.length) {
  //           this.categories = [];
  //           this.projectDetails = success.docs.length ? success.docs[0] : {};
  //           // console.log("projectDetails", this.projectDetails)
  //           this.setActionButtons();
  //           this.isNotSynced = this.projectDetails ? (this.projectDetails.isNew || this.projectDetails.isEdit) : false;
  //           this.projectDetails.categories.forEach((category: any) => {
  //             category.label ? this.categories.push(category.label) : this.categories.push(category.name);
  //           });
  //           this.setCardMetaData();
  //           this.projectCompletionPercent = this.projectServ.getProjectCompletionPercentage(this.projectDetails);
  //           this.getProjectTaskStatus();
  //         } else {
  //           this.getProjectsApi();
  //         }

  //       },
  //       (error) => {
  //         this.getProjectsApi();
  //       }
  //     );
  //   } else {
  //     this.getProjectsApi();
  //   }
  // }

  prepareSubTaskMeta() {
    // this.newSubtask = JSON.parse(JSON.stringify(this.utils.getMetaData("subTask")));
  }

  getTask() {
    this.db.query({ _id: this.parameters.id }).then(
      (success) => {
        this.project = success.docs.length ? success.docs[0] : success.docs;
        this.projectCopy = JSON.parse(JSON.stringify(this.project));
        let task = _.findIndex(this.projectCopy.tasks, (item) => {
          return item._id == this.parameters.taskId;
        });
        task > -1 ? (this.task = this.project.tasks[task]) : this.toast.showMessage("FRMELEMNTS_MSG_NO_TASK_FOUND", "danger");
        this.enableMarkButton = this.task.status === 'completed' ? true : false;
        this.taskDetails = JSON.stringify(this.task);
        this.attachments = [];
        this.setCardMetaData();
        this.setActionButtons();
        this.taskCompletionPercent = this.projectServ.getTaskCompletionPercentage(this.taskDetails);
        this.getSubtasksCount(this.task).then((data: number) => {
          this.subTaskCount = data;
        });
      },
      (error) => { 
        // this.getTaskApi();
      }
    );

  }

  async getTaskApi() {
    debugger
    if (this.task.subtasks && this.task.subtasks.length)
      this.taskProgress = this.utils.getCompletedSubtaskCount(this.task.subtasks);
  }

  refreshTheActions(){
    this.setActionButtons();
    this.taskCompletionPercent = this.projectServ.getTaskCompletionPercentage(this.taskDetails);
  }

  // set header, including action buttons
  setHeaderConfig() {
    this._headerConfig ={
      showHeader: true,
      showBurgerMenu: false,
      pageTitle: '',
      actionButtons: [],
    };
    this.headerService.updatePageConfig(this._headerConfig);
  }

 // set task details
  setCardMetaData() {
    this.cardMetaData = {
      title: this.task.name,
      subTitle: this.projectTitle || null,
      endDate: this.task.endDate
    }

    console.log("projectTitle", this.projectTitle)
  }

  setActionButtons() {
    let defaultOptions = actions.TASK_ACTIONS;
    console.log("defaultOptions", defaultOptions)
    this.taskActions = defaultOptions
  }

  // getProjectsApi() {
  //   const payload = {
  //     projectId: this.projectId,
  //     solutionId: this.solutionId,
  //     isProfileInfoRequired: false,
  //     programId: this.programId,
  //     templateId: this.templateId
  //   };
  //   this.projectServ.getProjectDetails(payload);
  // }

  // getProjectTaskStatus() {
  //   if (!this.projectDetails.tasks && !this.projectDetails.tasks.length) {
  //     return
  //   }
  //   let taskIdArr = this.getAssessmentTypeTaskId()

  //   if (!taskIdArr.length) {
  //     return
  //   }
  //   if (!this.networkFlag) {
  //     return;
  //   }
  //   const config = {
  //     url: urlConstants.API_URLS.PROJCET_TASK_STATUS + `${this.projectDetails._id}`,
  //     payload: {
  //       taskIds: taskIdArr,
  //     },
  //   };
  //   this.unnatiService.post(config).subscribe(
  //     (success) => {
  //       if (!success.result) {
  //         return;
  //       }
  //       this.updateAssessmentStatus(success.result);
  //     },
  //     (error) => {
  //     }
  //   );
  // }

  // getAssessmentTypeTaskId() {
  //   const assessmentTypeTaskIds = [];
  //   for (const task of this.projectDetails.tasks) {
  //     task.type === "assessment" || task.type === "observation" ? assessmentTypeTaskIds.push(task._id) : null;
  //   }
  //   return assessmentTypeTaskIds;
  // }

  setSubtaskStatus() {
    
  }
  
  getSubtasksCount(task) {
    return new Promise(function (resolve) {
      let count = 0;
      if (task.children && task.children.length) {
        task.children.forEach((subtask) => {
          if (!subtask.isDeleted) {
            count = count + 1;
          }
        });
        resolve(count);
      } else {
        resolve(null);
      }
    });
  }

  // updateAssessmentStatus(data) {
  //   // if task type is assessment or observation then check if it is submitted and change the status and update in db
  //   let isChnaged = false
  //   this.projectDetails.tasks.map((t) => {
  //     data.map((d) => {
  //       if (d.type == 'assessment' || d.type == 'observation') {//check if type is observation or assessment 
  //         if (d._id == t._id && d.submissionDetails.status) {
  //           // check id matches and task details has submissionDetails
  //           if (!t.submissionDetails || t.submissionDetails.status != d.submissionDetails.status) {
  //             t.submissionDetails = d.submissionDetails;
  //             t.isEdit = true
  //             isChnaged = true;
  //             t.isEdit = true
  //             this.projectDetails.isEdit = true
  //           }
  //         }
  //       }

  //     });
  //   });
  //   isChnaged ? this.updateLocalDb(true) : null// if any assessment/observatiom task status is changed then only update 
  //   this.ref.detectChanges();
  // }

  updateLocalDb(setIsEditTrue = false) {
    this.taskDetails.isEdit = setIsEditTrue ? true : this.taskDetails.isEdit;
    this.db.update(this.taskDetails).then(success => {
      this.taskDetails._rev = success.rev;
    })
  }

  // (click) functions

  onAction(event) {
    switch (event) {
      case 'share':
        // this.network.isNetworkAvailable
        //   ? this.projectServ.openSyncSharePopup('shareProject', this.projectDetails.title,this.projectDetails)
        //   : this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
        console.log("task share")
        break;
      case 'edit':
        // this.router.navigate([`/${RouterLinks.PROJECT}/${RouterLinks.PROJECT_EDIT}`, this.projectDetails._id]);
        console.log("task edit")
        break;
      case 'delete':
        this.task.isDeleted = true;
        this.task.isEdit = true;
        this.refreshTheActions();
        this.updateLocalDb(true);
      break
    }
  }

  async submitProjectConfirmation() {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_SUBMIT_PROJECT", "FRMELEMNTS_LBL_SUBMIT_PROJECT", "NO", "YES"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'central-alert',
      header: data['FRMELEMNTS_LBL_SUBMIT_PROJECT'],
      message: data["FRMELEMNTS_MSG_SUBMIT_PROJECT"],
      buttons: [
        {
          text: data["NO"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            this.toast.showMessage("FRMELEMNTS_MSG_FILE_NOT_SHARED", "danger");
          },
        },
        {
          text: data["YES"],
          handler: () => {
            this.submitImprovment();
          },
        },
      ],
    });
    await alert.present();
  }

  async sortSubtasks() {
    let taskData: any = await this.utils.getSortSubtasks(this.task);
    this.task = taskData.task;
    this.sortedSubtasks = taskData.sortedSubtasks;
    this.subtaskCount = taskData.subtaskCount;
  }

  async getTemplateByExternalId() {
    // let resp = await this.projectServ.getTemplateByExternalId(this.id);
    // this.programId = resp?.result?.programInformation?.programId || null;
    // this.task = resp?.result.task;
    if (this.task?.taskId) {
      this.buttonLabel = 'FRMELEMNTS_LBL_CONTINUE_IMPROVEMENT'
    }
    this.cardMetaData = {
      title: this.task.name,
      subTitle: this.projectTitle || null,
      endDate: this.task.endDate
    }
  }

  doSyncAction() {
    if (this.network.isNetworkAvailable) {
      this.taskDetails.isNew
        ? this.projectServ.createNewProject(this.taskDetails)
        : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
    } else {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
    }
  }

  submitImprovment() {
    this.taskDetails.status = statusType.submitted;
    this.updateLocalDb(true);
    this.doSyncAction();
  }

}
