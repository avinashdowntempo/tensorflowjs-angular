import { TestBed } from '@angular/core/testing';

import { WebcamService } from './webcam.service';

describe('WebcamService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebcamService = TestBed.get(WebcamService);
    expect(service).toBeTruthy();
  });
});
