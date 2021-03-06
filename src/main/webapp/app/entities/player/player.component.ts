import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

import {Subscription} from 'rxjs';
import {JhiAlertService, JhiEventManager, JhiParseLinks} from 'ng-jhipster';

import {IPlayer} from 'app/shared/model/player.model';
import {Principal} from 'app/core';

import {ITEMS_PER_PAGE} from 'app/shared';
import {PlayerService} from './player.service';
import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-player',
    templateUrl: './player.component.html'
})
export class PlayerComponent implements OnInit, OnDestroy {
    // currentAccount: any;
    players: IPlayer[];
    error: any;
    success: any;
    eventSubscriber: Subscription;
    routeData: any;
    links: any;
    totalItems: any;
    queryCount: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;
    filterValue = '*';

    recordsPerPageValue = 10;
    recordsPerPageOptions = [10, 25, 50];

    selectedColumn = 'mail';

    selectedType = 'All';
    typeOptions = ['All', 'Not all'];

    selectedField: any;
    fields = [{
        'id': 'username',
        'value': 'Username'
    }, {
        'id': 'nickName',
        'value': 'Nickname'
    }, {
        'id': 'fullName',
        'value': 'fullName'
    }, {
        'id': 'address',
        'value': 'address'
    }, {
        'id': 'email',
        'value': 'email'
    }, {
        'id': 'mobile',
        'value': 'mobile'
    }, {
        'id': 'phone',
        'value': 'phone'
    }, {
        'id': 'contractId',
        'value': 'contractId'
    }, {
        'id': 'gameAccount',
        'value': 'gameAccount'
    }];

    constructor(private playerService: PlayerService,
                private parseLinks: JhiParseLinks,
                private jhiAlertService: JhiAlertService,
                private principal: Principal,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private eventManager: JhiEventManager) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.routeData = this.activatedRoute.data.subscribe(data => {
            this.page = data.pagingParams.page;
            this.previousPage = data.pagingParams.page;
            this.reverse = data.pagingParams.ascending;
            this.predicate = data.pagingParams.predicate;
        });
    }

    loadAll() {
        this.playerService
            .query({
                page: this.page - 1,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IPlayer[]>) => this.paginatePlayers(res.body, res.headers),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    loadPage(page: number) {
        if (page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }

    transition() {
        this.router.navigate(['/player'], {
            queryParams: {
                page: this.page,
                size: this.itemsPerPage,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        });
        this.loadAll();
    }

    clear() {
        this.page = 0;
        this.router.navigate([
            '/player',
            {
                page: this.page,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        ]);
        this.loadAll();
    }

    ngOnInit() {
        this.loadAll();
        this.registerChangeInPlayers();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IPlayer) {
        return item.id;
    }

    registerChangeInPlayers() {
        this.eventSubscriber = this.eventManager.subscribe('playerListModification', response => this.loadAll());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    private paginatePlayers(data: IPlayer[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        this.queryCount = this.totalItems;
        this.players = data;
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    beforeChange($event: NgbTabChangeEvent) {

        this.selectedColumn = $event.nextId;

        // console.log($event.nextId);
    }

    getSelectedFieldValue(player: IPlayer) {
        if (this.selectedColumn === 'mail') {
            return player.email;
        } else if (this.selectedColumn === 'mobile') {
            return player.mobile;
        } else if (this.selectedColumn === 'tel') {
            return player.phone;
        }
    }

    search() {

    }
}
