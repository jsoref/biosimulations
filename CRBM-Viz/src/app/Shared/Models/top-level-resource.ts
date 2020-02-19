import { AccessLevel } from '../Enums/access-level';
import { License } from '../Enums/license';
import { Identifier } from './identifier';
import { JournalReference } from './journal-reference';
import { Person } from './person';
import { RemoteFile } from './remote-file';
import { User } from './user';

import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { UserService } from '../Services/user.service';

export abstract class TopLevelResource {
  id?: string;
  name?: string;
  image?: File | RemoteFile;
  description?: string;
  tags?: string[];
  identifiers?: Identifier[];
  refs?: JournalReference[];
  authors?: (User | Person)[];
  owner?: User;
  OWNER?: string;
  access?: AccessLevel;
  accessToken?: string;
  license?: License;
  created?: Date;
  updated?: Date;
  userService: UserService;
  owner$: Observable<User>;

  abstract getIcon(): object;

  abstract getRoute(): (string | number)[];
  // TODO make this return an observable
  getAuthors(): (User | Person)[] {
    if (this.authors && this.authors.length) {
      return this.authors;
    } else {
      return [this.owner];
    }
  }
  getOwner(): Observable<User> {
    if (this.userService) {
      if (this.owner) {
        return of(this.owner);
      } else {
        this.owner$ = this.userService.get$(this.OWNER).pipe(
          shareReplay(1),
          tap(owner => (this.owner = owner))
        );
        return this.owner$;
      }
    } else {
      throw new Error('No user service');
    }
  }
}
