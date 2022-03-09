import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderService } from '@app/services';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AttachmentService, DbService, NetworkService, ProjectService, statusType, ToastService, UtilsService } from '../../core';
import { actions } from '../../core/constants/actions.constants';
import * as _ from "underscore";
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.page.html',
  styleUrls: ['./add-file.page.scss'],
})
export class AddFilePage implements OnInit {
  description: string;
  parameters;
  isLinkModalOpen: boolean = false;
  actionItems = actions.FILE_UPLOAD_OPTIONS;
  _appHeaderSubscription: Subscription;
  headerObservable: any;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    actionButtons: [],
    pageTitle: ''
  };
  remarks: '';
  button:string;
  attachments: any = [];
  projectId;
  taskId;
  project;
  task;
  viewOnlyMode: boolean = false;
  projectCopy;
  exitPage: boolean = false;
  taskIndex;
  unregisterBackButton: Subscription;
  constructor(
    private routerParams: ActivatedRoute,
    private router: Router,
    private headerService: AppHeaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private db: DbService,
    private attachmentService: AttachmentService,
    private platform: Platform,
    private projectService: ProjectService,
    private location: Location,
    private network: NetworkService,
    private projectServ: ProjectService,
    private toast: ToastService,
  ) {
    routerParams.params.subscribe(urlParams => {
      this.projectId = urlParams.id;
      this.getProject();
    })
    routerParams.queryParams.subscribe(params => {
      this.description = params.taskId ? actions.TASK_FILE_DESCRIPTION.label : actions.PROJECT_FILE_DESCRIPTION.label;
      this.taskId = params.taskId;
    })
  }

  ngOnInit() {}
  async ionViewWillEnter() {
    this.headerService.showHeaderWithBackButton();
  }
  getProject() {
    this.db.query({ _id: this.projectId }).then(
      (success) => {
        if (success?.docs.length) {
          this.project = success.docs[0];
        }
        this.projectCopy = JSON.parse(JSON.stringify(this.project ));
        this.taskId ? this.getTask() : this.setHeaderConfig();
      },
      (error) => {}
    );
  }

  getTask() {
    this.taskIndex = _.findIndex(this.project.tasks, (item) => {
      return item._id == this.taskId;
    });
    this.task = this.project.tasks[this.taskIndex];
    this.setHeaderConfig();
  }
  setHeaderConfig() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerConfig.pageTitle = this.taskId? this.task.name : this.project.title;
    this.button =this.taskId? 'FRMELEMNTS_LBL_ATTACH_FILES' : "FRMELEMNTS_LBL_SUBMIT_PROJECT";
     if(this.taskId){
    this.attachments = this.task?.attachments ? this.task.attachments : [];
     }else{
      this.attachments = this.project?.attachments ? this.project?.attachments : [];
     }
    this.remarks = this.taskId? this.task.remarks : this.project?.remarks;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ngOnDestroy() {
    if (this._appHeaderSubscription) {
      this._appHeaderSubscription.unsubscribe();
    }
  }
  async deleteConfirm(index) {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_DELETE_ATTACHMENT_CONFIRM", "CANCEL", "OK"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'attachment-delete-alert',
      message: data['FRMELEMNTS_MSG_DELETE_ATTACHMENT_CONFIRM'],
      buttons: [
        {
          text: data["OK"],
          handler: () => {
            this.delete(index);
          },
        }, {
          text: data["CANCEL"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
      ],
    });
    await alert.present();
  }

  delete(index) {
    this.attachments.splice(index, 1);
    this.task.isEdit = true;
    this.exitPage = false;
    this.update('delete');
  }
  onAction(event) {
    if (event == 'openLink') {
      this.toggleLinkModal();
      return;
    }
    this.attachmentService.openAttachmentSource(event, this.attachments);
    this.exitPage = false;
  }

  submit() {
    if (this.taskId) {
      this.task.attachments = this.attachments; 
      this.task.remarks = this.remarks;
      if (JSON.stringify(this.projectCopy.tasks[this.taskIndex]) !== JSON.stringify(this.task)) {
        this.task.isEdit = true;
        this.project.isEdit = true;
        this.exitPage = true;
        this.update('submit');
        this.toast.showMessage('FRMELEMNTS_LBL_FILES_ATTACHED','success')
      }else{
        this.location.back();
      }
    } else {
      this.submitProjectConfirmation();
    }
  }
  linkEvent(event) {
    if (event) {
      this.attachments = this.attachments.concat(this.projectService.getLinks(event));
    }
    this.toggleLinkModal();
  }
  toggleLinkModal() {
    this.isLinkModalOpen = !this.isLinkModalOpen;
  }
  update(type) {
    this.project.isEdit = true;
    this.db
      .update(this.project)
      .then((success) => {
        this.project._rev = success.rev;
        if (type == 'submit') {
          this.attachments = [];
          this.project.status == statusType.submitted ? this.doSyncAction() : this.location.back();
        }
      })
  }
  doSyncAction() {
    if (this.network.isNetworkAvailable) {
      this.project.isNew
        ? this.projectServ.createNewProject(this.project)
        : this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.SYNC}`], { queryParams: { projectId: this.projectId } });
    } else {
      this.toast.showMessage('FRMELEMNTS_MSG_PLEASE_GO_ONLINE', 'danger');
    }
  }
  async pageExitConfirm() {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_ATTACHMENT_PAGE_EXIT_CONFIRM", "FRMELEMNTS_BTN_EXIT_PAGE","FRMELEMNTS_BTN_YES_PAGE", "FRMELEMNTS_LBL_YES", "NO"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'attachment-delete-alert',
      header: data['FRMELEMNTS_BTN_EXIT_PAGE'],
      message:data['FRMELEMNTS_MSG_ATTACHMENT_PAGE_EXIT_CONFIRM'],
      buttons: [
        {
          text: this.taskId ? data["FRMELEMNTS_BTN_YES_PAGE"] : data["FRMELEMNTS_LBL_YES"],
          handler: () => {
           this.location.back();
            this.exitPage = true;
          },
        }, {
          text: data["NO"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
          },
        },
      ],
    });
    await alert.present();
  }
  async submitProjectConfirmation() {
    let data;
    this.translate.get(["FRMELEMNTS_MSG_SUBMIT_PROJECT", "FRMELEMNTS_LBL_SUBMIT_PROJECT", "CANCEL", "FRMELEMNTS_BTN_SUBMIT"]).subscribe((text) => {
      data = text;
    });
    const alert = await this.alert.create({
      cssClass: 'central-alert',
      header: data['FRMELEMNTS_LBL_SUBMIT_PROJECT'],
      message: data["FRMELEMNTS_MSG_SUBMIT_PROJECT"],
      buttons: [
        {
          text: data["CANCEL"],
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: data["FRMELEMNTS_BTN_SUBMIT"],
          handler: () => {
            this.submitProject();
          },
        },
      ],
    });
    await alert.present();
  }

  submitProject() {
    this.project.attachments = this.attachments;
    this.project.remarks = this.remarks;
    this.project.status = statusType.submitted;
    this.exitPage = true;
    this.update('submit');
  }
}