import { ProfileSettingsPage } from './profile-settings.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    Framework,
    FrameworkCategoryCodesGroup,
    GetSuggestedFrameworksRequest
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    SunbirdQRScanner,
    ContainerService,
    AppHeaderService, FormAndFrameworkUtilService
} from '../../services';
import { SplashScreenService } from '../../services/splash-screen.service';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType } from '../../services/telemetry-constants';
import { of, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { doesNotReject } from 'assert';

describe('ProfileSettingsPage', () => {
    let profileSettingsPage: ProfileSettingsPage;
    const mockAlertCtrl: Partial<AlertController> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box')
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRouter: Partial<Router> = {};
    const mockScanner: Partial<SunbirdQRScanner> = {};
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;

    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};

    beforeAll(() => {
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of profileSettingsPage', () => {
        expect(profileSettingsPage).toBeTruthy();
    });

    it('should fetch active profile by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
           setTimeout(() => {
               expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                   ImpressionType.VIEW, '',
                   PageId.ONBOARDING_PROFILE_PREFERENCES,
                   Environment.ONBOARDING
               );
               expect(mockAppVersion.getAppName).toHaveBeenCalled();
               expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
               done();
           }, 0);
        });
    });

    it('should fetch active profile by invoked ngOnInit()', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({} as any));
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                Environment.ONBOARDING
            );
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            done();
        });
    });

    xit('should subscribe formControl to call ngOnDestroy()', (done) => {
        // arrange
        const data = jest.fn();
        const mockFormControlSubscriptions = {
            unsubscribe: data
        } as Partial<Subscription>;
        // act
        profileSettingsPage.ngOnDestroy();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('onSubmitAttempt()', () => {
        it('should generate submit clicked telemetry  if board is empty onSubmitAttempt()', () => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: []}};
                            break;
                        case 'board':
                            value = { value: { board: []}};
                            break;
                        case 'medium':
                            value = { value: { medium: []}};
                            break;
                        case 'grade':
                            value = [];
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: [], medium: [], grade: []
                },
            } as any;
            profileSettingsPage.boardSelect = { open: jest.fn() };
            mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
        });

        it('should generate submit clicked telemetry  if medium is empty onSubmitAttempt()', () => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: ['AP']}};
                            break;
                        case 'board':
                            value = { value: { board: ['AP']}};
                            break;
                        case 'medium':
                            value = { value: { medium: []}};
                            break;
                        case 'grade':
                            value = [];
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: [], grade: []
                }
            } as any;
            profileSettingsPage.boardSelect = {open: jest.fn()};
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
        });

        it('should generate submit clicked telemetry  if grades is empty onSubmitAttempt()', () => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForm = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: ['AP']}};
                            break;
                        case 'board':
                            value = { value: { board: ['AP']}};
                            break;
                        case 'medium':
                            value = { value: { medium: ['English']}};
                            break;
                        case 'grade':
                            value = { value: { medium: []}};
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: ['English'], grade: []
                }
            } as any;
            profileSettingsPage.boardSelect = {open: jest.fn()};
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
        });
      });

    it('should control Scanner to called handleActiveScanner()', (done) => {
    // arrange
    mockRouter.getCurrentNavigation = jest.fn(() => ({
        extras: null
    }as any));
    profileSettingsPage = new ProfileSettingsPage(
        mockProfileService as ProfileService,
        mockFrameworkService as FrameworkService,
        mockFrameworkUtilService as FrameworkUtilService,
        mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
        mockTranslate as TranslateService,
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        mockAppGlobalService as AppGlobalService,
        mockEvents as Events,
        mockScanner as SunbirdQRScanner,
        mockPlatform as Platform,
        mockCommonUtilService as CommonUtilService,
        mockContainer as ContainerService,
        mockHeaderService as AppHeaderService,
        mockRouter as Router,
        mockAppVersion as AppVersion,
        mockAlertCtrl as AlertController,
        mockLocation as Location,
        mockSplashScreenService as SplashScreenService,
        mockActivatedRoute as ActivatedRoute
    );
    mockScanner.stopScanner = jest.fn();
    // act
    profileSettingsPage.handleActiveScanner();
    // assert
    setTimeout(() => {
        expect(mockRouter.getCurrentNavigation).toHaveBeenCalled();
        done();
    }, 0);
    });

    it('should control Scanner to called handleActiveScanner()', (done) => {
        // arrange
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    stopScanner: true,
                    forwardMigration: true
                }
            }
        }as any));
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute
        );
        mockScanner.stopScanner = jest.fn();
        // act
        profileSettingsPage.handleActiveScanner();
        // assert
        setTimeout(() => {
            expect(mockRouter.getCurrentNavigation).toHaveBeenCalled();
            expect(mockScanner.stopScanner).toHaveBeenCalled();
            done();
        }, 500);
    });

    it('should handle all header events by invoked ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.hideHeader = jest.fn();
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockActivatedRoute.snapshot.queryParams = { reOnboard: true };
        profileSettingsPage.hideBackButton = true;
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should not reload the onboarding screens id reOnboard is null ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.hideHeader = jest.fn();
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockActivatedRoute.snapshot.queryParams = null;
        profileSettingsPage.hideBackButton = false;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        window.history.state['showFrameworkCategoriesMenu'] = true;
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);

    });

    it('should handle hideHeader events by invoked ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    hideBackButton: true
                }
            }
        } as any));
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleHeaderEvents').mockImplementation(() => {
            return;
        });
        mockHeaderService.hideHeader = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        jest.spyOn(profileSettingsPage, 'handleBackButton').mockImplementation();
        window.history.state['showFrameworkCategoriesMenu'] = true;
        profileSettingsPage['navParams'] = null;
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should handle all header events by invoked ionViewDidEnter()', (done) => {
        // arrange
        profileSettingsPage.hideOnboardingSplashScreen = jest.fn();
        // act
        profileSettingsPage.ionViewDidEnter();
        // assert
        setTimeout(() => {
            expect(profileSettingsPage.hideOnboardingSplashScreen).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should submit form details for board blanked to call onSubmitAttempt()', () => {
        // arrange
        const syllabusData = new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
        mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const values = new Map();
        values['medium'] = 'na';
        profileSettingsPage.boardSelect = {open: jest.fn()};
        profileSettingsPage.mediumSelect = ['hindi'];
        profileSettingsPage.gradeSelect = ['class1'];

        // act
        profileSettingsPage.onSubmitAttempt();
        // assert
        expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
            expect.anything(),
            'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            InteractSubtype.FINISH_CLICKED
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'submit-clicked',
            Environment.HOME,
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            undefined,
            values
        );
    });

    it('should submit form details for medium blank to call onSubmitAttempt()', () => {
        // arrange
        mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const values = new Map();
        values['board'] = 'na';
        profileSettingsPage.profileSettingsForm = {
            controls: {
                syllabus: {
                    validator: jest.fn()
                }
            },
            value: {
                syllabus: [], board: ['odisha'], medium: [], grade: []
            }
        } as any;
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAppVersion as AppVersion,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute
        );
        profileSettingsPage.boardSelect = {open: jest.fn()};
        profileSettingsPage.mediumSelect = ['hindi'];
        profileSettingsPage.gradeSelect = ['class1'];

        // act
        profileSettingsPage.onSubmitAttempt();
        // assert
        expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
            expect.anything(),
            'failed',
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            InteractSubtype.FINISH_CLICKED
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'submit-clicked',
            Environment.HOME,
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            undefined,
            values
        );

    });

    describe('boardClicked', () => {

        it('should prevent assigning default values and open board details popup', (done) => {
            // arrange
            const payloadEvent: any = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn()
            };
            profileSettingsPage.boardSelect.open = jest.fn();
            // act
            profileSettingsPage.boardClicked(payloadEvent);
            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(false);
            setTimeout(() => {
                expect(profileSettingsPage.boardSelect.open).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should skip assigning default values', () => {
            // arrange
            const payloadEvent: any = null;
            profileSettingsPage.boardSelect.open = jest.fn();
            // act
            profileSettingsPage.boardClicked(payloadEvent);
            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(false);
            setTimeout(() => {
                expect(profileSettingsPage.boardSelect.open).toHaveBeenCalled();
            }, 0);
        });

    });

    describe('handleBackButton', () => {

        it('should reset profile setting if QR scanner is dissabled', () => {
            // arrange
            profileSettingsPage.showQRScanner = false;

            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            // act
            profileSettingsPage.handleBackButton(true);

            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(true);
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
        });

        it('should dismiss the popup if QR scanner is open', () => {
            // arrange
            profileSettingsPage.showQRScanner = true;

            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            // act
            profileSettingsPage.handleBackButton(true);

            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
        });

    });

    describe('handleHeaderEvents', () => {

        it('should trigger back button functionality if header-back button is clicked', () => {
            // arrange
            const eventPayload = { name: 'back' };
            profileSettingsPage.handleBackButton = jest.fn();
            // act
            profileSettingsPage.handleHeaderEvents(eventPayload);
            // assert
            expect(profileSettingsPage.handleBackButton).toHaveBeenCalledWith(true);
        });

    });

    describe('cancelEvent', () => {

        it('should generate interact event when event is canceled', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            profileSettingsPage.cancelEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        });

    });

    describe('openQRScanner', () => {

        it('should open the QR scanner', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockScanner.startScanner = jest.fn(() => Promise.resolve('skip'));
            // act
            profileSettingsPage.openQRScanner();
            // assert
            expect(mockScanner.startScanner).toHaveBeenCalled();
            expect(profileSettingsPage.showQRScanner).toEqual(true);
        });

        it('should open the QR scanner but skip generating telemetry event', () => {
            // arrange
            mockScanner.startScanner = jest.fn(() => Promise.resolve(''));
            // act
            profileSettingsPage.openQRScanner()
            // assert
            expect(mockScanner.startScanner).toHaveBeenCalled();
        });

    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe the subscriptions', () => {
            // arrange
            profileSettingsPage['headerObservable'] = {
                unsubscribe: jest.fn()
            };
            profileSettingsPage['unregisterBackButton'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            profileSettingsPage.ionViewWillLeave();
            // assert
            expect(profileSettingsPage['headerObservable'].unsubscribe).toHaveBeenCalled();
            expect(profileSettingsPage['unregisterBackButton'].unsubscribe).toHaveBeenCalled();
        });

        it('should unsubscribe the subscriptions except backbutton subscription', () => {
            // arrange
            profileSettingsPage['headerObservable'] = {
                unsubscribe: jest.fn()
            };
            profileSettingsPage['unregisterBackButton'] = null;
            // act
            profileSettingsPage.ionViewWillLeave();
            // assert
            expect(profileSettingsPage['headerObservable'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('hideOnboardingSplashScreen', () => {
        it('should hide the splash screen when the user reopens the onboarding profile page', () => {
            // arrange
            profileSettingsPage['navParams'] = { forwardMigration: true };
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
            // act
            profileSettingsPage.hideOnboardingSplashScreen();
            // assert
            expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
        });

        it('should skip hide the splash screen when the splash screen is already closed', () => {
            // arrange
            profileSettingsPage['navParams'] = { forwardMigration: false };
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
            // act
            profileSettingsPage.hideOnboardingSplashScreen();
            // assert
            expect(profileSettingsPage['navParams'].forwardMigration).toEqual(false);
        });
    });

    describe('ngOnDestroy', () => {
        it('should stop detecting the profile setting changes on leaving the page', () => {
            // arrange
            profileSettingsPage['formControlSubscriptions'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            profileSettingsPage.ngOnDestroy();
            // commonUtilService.getLoader
            expect(profileSettingsPage['formControlSubscriptions'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('fetchSyllabusList', () => {

        it('should fetch all the syllabus list details', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            profileSettingsPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING'
            }];
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                language: 'en',
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            profileSettingsPage.fetchSyllabusList();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
            }, 0);
        });

        it('should show data not found toast message if syllabus list is empty.', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            profileSettingsPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [];
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                language: 'en',
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            profileSettingsPage.fetchSyllabusList();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
            }, 0);
        });

    });

});