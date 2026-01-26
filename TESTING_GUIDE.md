# Guia de Testes

## Estrutura de Testes

Todos os testes devem estar no mesmo diretório do arquivo testado:

```
src/
├── app/
│   ├── core/
│   │   ├── http/
│   │   │   ├── http.service.ts
│   │   │   └── http.service.spec.ts
│   │   └── guards/
│   │       ├── auth.guard.ts
│   │       └── auth.guard.spec.ts
│   └── pages/
│       └── musicians/
│           ├── services/
│           │   ├── musician.service.ts
│           │   └── musician.service.spec.ts
│           └── musicians/
│               ├── musicians.ts
│               └── musicians.spec.ts
```

## Setup de Testes

```bash
npm test                    # Executar todos os testes
npm test -- --watch       # Modo watch
npm test -- --code-coverage  # Com coverage report
```

## Exemplos de Testes

### 1. Testes de Serviço

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MusicianService } from './musician.service';
import { Musician, CreateMusician } from '../models/musician.model';

describe('MusicianService', () => {
  let service: MusicianService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MusicianService]
    });

    service = TestBed.inject(MusicianService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('should fetch all musicians', () => {
      const mockMusicians: Musician[] = [
        { id: 1, firstName: 'João', lastName: 'Silva', email: 'joao@test.com' },
        { id: 2, firstName: 'Maria', lastName: 'Santos', email: 'maria@test.com' }
      ];

      service.list().subscribe(musicians => {
        expect(musicians.length).toBe(2);
        expect(musicians).toEqual(mockMusicians);
      });

      const req = httpMock.expectOne('musicians.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockMusicians);
    });

    it('should handle errors gracefully', () => {
      service.list().subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error).toBeTruthy();
        }
      );

      const req = httpMock.expectOne('musicians.json');
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getById', () => {
    it('should fetch a musician by id', () => {
      const mockMusician: Musician = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@test.com'
      };

      service.getById(1).subscribe(musician => {
        expect(musician).toEqual(mockMusician);
      });

      const req = httpMock.expectOne('musicians.json/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockMusician);
    });
  });

  describe('create', () => {
    it('should create a new musician', () => {
      const newMusician: CreateMusician = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@test.com'
      };

      const mockResponse: Musician = {
        id: 1,
        ...newMusician,
        createdAt: new Date().toISOString()
      };

      service.create(newMusician).subscribe(musician => {
        expect(musician.id).toBe(1);
        expect(musician.firstName).toBe('João');
      });

      const req = httpMock.expectOne('musicians.json');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newMusician);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a musician', () => {
      const updates = { email: 'newemail@test.com' };
      const mockResponse: Musician = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        email: 'newemail@test.com'
      };

      service.update(1, updates).subscribe(musician => {
        expect(musician.email).toBe('newemail@test.com');
      });

      const req = httpMock.expectOne('musicians.json/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a musician', () => {
      service.delete(1).subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne('musicians.json/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
```

### 2. Testes de Componente

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MusicianComponent } from './musicians';
import { MusicianService } from '../services/musician.service';
import { of } from 'rxjs';

describe('MusicianComponent', () => {
  let component: MusicianComponent;
  let fixture: ComponentFixture<MusicianComponent>;
  let musicianService: jasmine.SpyObj<MusicianService>;

  beforeEach(async () => {
    const musicianServiceSpy = jasmine.createSpyObj('MusicianService', ['list']);

    await TestBed.configureTestingModule({
      imports: [MusicianComponent],
      providers: [
        { provide: MusicianService, useValue: musicianServiceSpy }
      ]
    }).compileComponents();

    musicianService = TestBed.inject(MusicianService) as jasmine.SpyObj<MusicianService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MusicianComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load musicians on init', () => {
    const mockMusicians = [
      { id: 1, firstName: 'João', lastName: 'Silva', email: 'joao@test.com' }
    ];

    musicianService.list.and.returnValue(of(mockMusicians));

    fixture.detectChanges(); // Triggers ngOnInit

    expect(musicianService.list).toHaveBeenCalled();
  });
});
```

### 3. Testes de Pipe

```typescript
import { TestBed } from '@angular/core/testing';
import { PhoneMaskPipe } from '../../../shared/pipes/common.pipes';

describe('PhoneMaskPipe', () => {
  let pipe: PhoneMaskPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhoneMaskPipe]
    });
    pipe = TestBed.inject(PhoneMaskPipe);
  });

  it('should format 10-digit phone number', () => {
    const result = pipe.transform('1133334444');
    expect(result).toBe('(11) 3333-4444');
  });

  it('should format 11-digit phone number', () => {
    const result = pipe.transform('11999994444');
    expect(result).toBe('(11) 99999-4444');
  });

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
```

### 4. Testes de Diretiva

```typescript
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreventDoubleClickDirective } from '../../../shared/directives/common.directives';
import { By } from '@angular/platform-browser';

@Component({
  template: `<button appPreventDoubleClick (click)="onClick()">Click me</button>`
})
class TestComponent {
  clickCount = 0;

  onClick(): void {
    this.clickCount++;
  }
}

describe('PreventDoubleClickDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreventDoubleClickDirective, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(By.css('button'));
    fixture.detectChanges();
  });

  it('should prevent double click', fakeAsync(() => {
    buttonElement.nativeElement.click();
    buttonElement.nativeElement.click(); // Second click should be prevented

    tick(600);

    expect(component.clickCount).toBe(1); // Only one click should register
  }));
});
```

### 5. Testes de Formulário

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseFormComponent, FormFieldConfig } from '../../../shared/base-classes/base-form.component';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" type="email" />
      <input formControlName="name" type="text" />
    </form>
  `
})
class TestFormComponent extends BaseFormComponent<any> {
  fields: FormFieldConfig[] = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'name', label: 'Name', type: 'text', required: true }
  ];
}

describe('BaseFormComponent', () => {
  let component: TestFormComponent;
  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with correct fields', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('name')).toBeTruthy();
  });

  it('should validate required fields', () => {
    expect(component.form.valid).toBeFalsy();

    component.form.patchValue({
      email: 'test@example.com',
      name: 'John'
    });

    expect(component.form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');

    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should emit form data on submit', (done) => {
    component.formSubmitted.subscribe((data) => {
      expect(data.email).toBe('test@example.com');
      done();
    });

    component.form.patchValue({
      email: 'test@example.com',
      name: 'John'
    });

    component.onSubmit();
  });
});
```

## Cobertura de Testes

Relatório de cobertura:
```bash
npm test -- --code-coverage
```

Arquivo: `coverage/index.html`

**Metas de cobertura:**
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Best Practices

### 1. AAA Pattern (Arrange, Act, Assert)
```typescript
it('should do something', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = service.process(input);
  
  // Assert
  expect(result).toBe('expected');
});
```

### 2. Isolamento com Mocks
```typescript
// ✅ Bom - Isolado
const serviceSpy = jasmine.createSpyObj('Service', ['method']);

// ❌ Evite - Dependências reais
const realService = new RealService(realHttp);
```

### 3. Descrições Claras
```typescript
// ✅ Bom
it('should return user when valid ID is provided', () => {});

// ❌ Evite
it('should work', () => {});
```

### 4. Testes Independentes
```typescript
// ✅ Bom - Cada teste é independente
beforeEach(() => {
  // Setup fresco para cada teste
});

// ❌ Evite - Testes dependentes
let service;
service = new Service(); // Compartilhado entre testes
```

## CI/CD Integration

Configure testes no pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --code-coverage
      - uses: codecov/codecov-action@v2
```

## Debugging de Testes

```bash
# Debug mode
ng test --browsers=Chrome --watch=true

# Specific test file
ng test --include='**/musician.service.spec.ts'

# Single run (CI)
ng test --watch=false --code-coverage
```

## Recursos

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
