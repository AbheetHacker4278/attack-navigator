import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatrixCommon } from './matrix-common';
import { Link, Metadata, TechniqueVM, ViewModel } from '../classes';
import { Matrix, Technique, Tactic } from '../classes/stix';
import { EventEmitter } from '@angular/core';

describe('MatrixCommon', () => {
    let service: MatrixCommon;
    let stixSDO = {
        "name": "Name",
        "description": "Description",
        "created": "2001-01-01T01:01:00.000Z",
        "modified": "2001-01-01T01:01:00.000Z",
        "x_mitre_version": "1.0",
    }
    let tacticSDO = {
        "id": "tactic-0",
        ...stixSDO,
        "name": "Reconnaissance",
        "type": "x-mitre-tactic",
        "x_mitre_shortname": "reconnaissance",
        "external_references": [
            {
                "external_id": "TA0043",
                "url": "https://attack.mitre.org/tactics/TA0043"
            }
        ]
    }
    let matrixSDO = {
        "external_references": [
            {
                "external_id": "enterprise-attack",
                "source_name": "mitre-attack",
                "url": "https://attack.mitre.org/matrices/enterprise"
            }
        ],
        "id": "x-mitre-matrix--eafc1b4c-5e56-4965-bd4e-66a6a89c88cc",
        "name":"Enterprise ATT&CK",
        "tactic_refs": ["tactic-0"]
    }
    let templateSDO = {
        ...stixSDO,
        "type": "attack-pattern",
        "x_mitre_platforms": ['PRE'],
        "kill_chain_phases": [
            {
                "kill_chain_name": "mitre-attack",
                "phase_name": "reconnaissance"
            }
        ],
    }
    let subtechniqueSDO1 = {
        ...templateSDO,
        "id": "attack-pattern-0-1",
        "external_references": [
            {
                "external_id": "T1595.002",
                "url": "https://attack.mitre.org/techniques/T1595/002"
            }
        ],
    }
    let subtechniqueSDO2 = {
        ...templateSDO,
        "id": "attack-pattern-0-2",
        "external_references": [
            {
                "external_id": "T1592.002",
                "url": "https://attack.mitre.org/techniques/T1592/002"
            }
        ],
    }
    let techniqueSDO = {
        ...templateSDO,
        "id": "attack-pattern-0",
        "external_references": [
            {
                "external_id": "T1595",
                "url": "https://attack.mitre.org/techniques/T1595"
            }
        ]
    }
    let techniqueSDO2 = {
        ...templateSDO,
        "id": "attack-pattern-1",
        "external_references": [
            {
                "external_id": "T1592",
                "url": "https://attack.mitre.org/techniques/T1592"
            }
        ]
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MatrixCommon]
        });
        service = TestBed.inject(MatrixCommon);
    });

    it('should be created', inject([MatrixCommon], (service: MatrixCommon) => {
        service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
        expect(service).toBeTruthy();
    }));

    // it('should change tactic row color', inject([MatrixCommon], async (service: MatrixCommon) => {
    //     service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
    //     service.viewModel.showTacticRowBackground = true;
    //     service.tacticRowStyle;
    //     var toNodeList = function(arrayOfNodes){
    //         var fragment:NodeListOf<HTMLElement>
    //         fragment = document.createElement('td');
    //         arrayOfNodes.forEach(function(item){
    //           fragment.appendChild(item.cloneNode());
    //         });
    //         return fragment.childNodes;
    //       };
    //     var mockedDocElement = document.createElement('td');
    //     var nodeList: NodeListOf<HTMLElement>;
    //     const element = spyOn(document, 'querySelectorAll').and.returnValue(toNodeList);
    //     service.viewModel.showTacticRowBackground = true;
    //     service.tacticRowStyle;
    //     await expect(service).toBeTruthy();
    // }));

    it('should filter techniques and tactics', inject([MatrixCommon], (service: MatrixCommon) => {
        let technique_list: Technique[] = [];
        let tactic_list: Tactic[] = [];
        service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
        let idToTacticSDO = new Map<string, any>();
        idToTacticSDO.set("tactic-0", tacticSDO);
        service.viewModel.showTacticRowBackground = true;
        service.tacticRowStyle;
        let st1 = new Technique(subtechniqueSDO1,[],null);
        let t1 = new Technique(techniqueSDO,[st1],null);
        technique_list.push(t1);
        let st2 = new Technique(subtechniqueSDO2,[],null);
        let t2 = new Technique(techniqueSDO2,[st2],null);
        technique_list.push(t2);
        let tvm_1 = new TechniqueVM("T1595^reconnaissance");
        let stvm_1 = new TechniqueVM("T1595.002^reconnaissance");
        tvm_1.score = '2';
        let tvm_2 = new TechniqueVM("T1592^reconnaissance");
        let stvm_2 = new TechniqueVM("T1592.002^reconnaissance");
        stvm_2.score = '3';
		service.viewModel.setTechniqueVM(tvm_1);
        service.viewModel.setTechniqueVM(tvm_2);
        service.viewModel.setTechniqueVM(stvm_1);
        service.viewModel.setTechniqueVM(stvm_2);
        service.viewModel.layout.showAggregateScores = true;
        service.viewModel.layout.aggregateFunction = "min";
        service.viewModel.filters.platforms.selection = ["PRE"];
        let tactic1 = new Tactic(tacticSDO,technique_list,null);
        tactic_list.push(tactic1);
        service.matrix = new Matrix(matrixSDO, idToTacticSDO,technique_list,null);
        service.applyControls(technique_list,tactic1);
        service.viewModel.layout.aggregateFunction = "max";
        service.applyControls(technique_list,tactic1);
        service.viewModel.layout.aggregateFunction = "sum";
        service.applyControls(technique_list,tactic1);
        service.viewModel.layout.aggregateFunction = "average";
        service.applyControls(technique_list,tactic1);
        service.sortTechniques(technique_list,tactic1);
        expect(service.filterTechniques(technique_list, tactic1)).toEqual(technique_list);
        service.viewModel.loaded = true;
        service.filterTactics(tactic_list);
        expect(service.filterTactics(tactic_list)).toEqual(tactic_list);
    }));

    it('should toggle', inject([MatrixCommon], (service: MatrixCommon) => {
        let technique_list: Technique[] = [];
        let tactic_list: Tactic[] = [];
        service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
        let idToTacticSDO = new Map<string, any>();
        idToTacticSDO.set("tactic-0", tacticSDO);
        let st1 = new Technique(subtechniqueSDO1,[],null);
        let t1 = new Technique(techniqueSDO,[st1],null);
        technique_list.push(t1);
        let tvm_1 = new TechniqueVM("T1595^reconnaissance");
        let stvm_1 = new TechniqueVM("T1595.002^reconnaissance");
		service.viewModel.setTechniqueVM(tvm_1);
        service.viewModel.setTechniqueVM(stvm_1);
        let tactic1 = new Tactic(tacticSDO,technique_list,null);
        tactic_list.push(tactic1);
        service.matrix = new Matrix(matrixSDO, idToTacticSDO,technique_list,null);
        service.onToggleSubtechniquesVisible(t1,tactic1);
        let tvm = service.viewModel.getTechniqueVM(t1, tactic1);
        expect(tvm.showSubtechniques).toEqual(true);
    }));

    it('should highlight and unhighlight', inject([MatrixCommon], (service: MatrixCommon) => {
        let technique_list: Technique[] = [];
        let tactic_list: Tactic[] = [];
        service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
        let idToTacticSDO = new Map<string, any>();
        idToTacticSDO.set("tactic-0", tacticSDO);
        let st1 = new Technique(subtechniqueSDO1,[],null);
        let t1 = new Technique(techniqueSDO,[st1],null);
        technique_list.push(t1);
        let tvm_1 = new TechniqueVM("T1595^reconnaissance");
        let stvm_1 = new TechniqueVM("T1595.002^reconnaissance");
		service.viewModel.setTechniqueVM(tvm_1);
        service.viewModel.setTechniqueVM(stvm_1);
        let tactic1 = new Tactic(tacticSDO,technique_list,null);
        tactic_list.push(tactic1);
        service.matrix = new Matrix(matrixSDO, idToTacticSDO,technique_list,null);
        service.onTechniqueHighlight(null,t1,tactic1);
        expect(service.viewModel.highlightedTactic.name).toEqual("Reconnaissance");
        service.onTechniqueUnhighlight(null);
        expect(service.viewModel.highlightedTactic).toEqual(null);
    }));

    it('should left click on technique', inject([MatrixCommon], (service: MatrixCommon) => {
        let technique_list: Technique[] = [];
        let tactic_list: Tactic[] = [];
        let idToTacticSDO = new Map<string, any>();
        idToTacticSDO.set("tactic-0", tacticSDO);
        let vm1 = service.viewModelsService.newViewModel("test1","enterprise-attack-13");
        let st1 = new Technique(subtechniqueSDO1,[],null);
        let t1 = new Technique(techniqueSDO,[st1],null);
        technique_list.push(t1);
        let tvm_1 = new TechniqueVM("T1595^reconnaissance");
        let stvm_1 = new TechniqueVM("T1595.002^reconnaissance");
        let st2 = new Technique(subtechniqueSDO2,[],null);
        let t2 = new Technique(techniqueSDO2,[st2],null);
        technique_list.push(t2);
        let tvm_2 = new TechniqueVM("T1592^reconnaissance");
        let stvm_2 = new TechniqueVM("T1592.002^reconnaissance");
		vm1.setTechniqueVM(tvm_1);
        vm1.setTechniqueVM(stvm_1);
        vm1.setTechniqueVM(tvm_2);
        vm1.setTechniqueVM(stvm_2);
        let tactic1 = new Tactic(tacticSDO,technique_list,null);
        tactic_list.push(tactic1);
        service.matrix = new Matrix(matrixSDO, idToTacticSDO,technique_list,null);
        let e1 = new EventEmitter<any>();
        let event = {"shift":true};
        service.viewModel = vm1;
        let emitSpy = spyOn(service.viewModelsService.onSelectionChange, 'emit');
        service.configService.setFeature("selecting_techniques", true);
        service.onTechniqueLeftClick(e1,t1,tactic1);
        expect(emitSpy).toHaveBeenCalled();
        service.onTechniqueLeftClick(event,t1,tactic1);
        expect(emitSpy).toHaveBeenCalled();
        spyOn(service.viewModel, 'isTechniqueSelected').and.returnValues(false, true, false);
        service.onTechniqueLeftClick(event,t1,tactic1);
        expect(emitSpy).toHaveBeenCalled();
        service.onTechniqueLeftClick(e1,t1,tactic1);
        expect(emitSpy).toHaveBeenCalled();
        spyOn(service.viewModel, 'getSelectedTechniqueCount').and.returnValue(2);
        vm1.activeTvm = tvm_2;
        service.viewModel = vm1;
        service.onTechniqueLeftClick(e1,t1,tactic1);
        expect(emitSpy).toHaveBeenCalled();
    }));

    it('on tactic click', inject([MatrixCommon], (service: MatrixCommon) => {
        let technique_list: Technique[] = [];
        let tactic_list: Tactic[] = [];
        service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
        let idToTacticSDO = new Map<string, any>();
        idToTacticSDO.set("tactic-0", tacticSDO);
        let st1 = new Technique(subtechniqueSDO1,[],null);
        let t1 = new Technique(techniqueSDO,[st1],null);
        technique_list.push(t1);
        let tvm_1 = new TechniqueVM("T1595^reconnaissance");
        let stvm_1 = new TechniqueVM("T1595.002^reconnaissance");
        let st2 = new Technique(subtechniqueSDO2,[],null);
        let t2 = new Technique(techniqueSDO2,[st2],null);
        technique_list.push(t2);
        let tvm_2 = new TechniqueVM("T1592^reconnaissance");
        let stvm_2 = new TechniqueVM("T1592.002^reconnaissance");
		service.viewModel.setTechniqueVM(tvm_1);
        service.viewModel.setTechniqueVM(stvm_1);
        service.viewModel.setTechniqueVM(tvm_2);
        service.viewModel.setTechniqueVM(stvm_2);
        let tactic1 = new Tactic(tacticSDO,technique_list,null);
        tactic_list.push(tactic1);
        service.matrix = new Matrix(matrixSDO, idToTacticSDO,technique_list,null);
        service.configService.setFeature("selecting_techniques", true)
        service.onTacticClick(tactic1);
        expect(service.viewModel.selectedTechniques.size).toEqual(2);
        spyOn(service.viewModel, 'isTacticSelected').and.returnValue(true);
        service.onTacticClick(tactic1);
        expect(service.viewModel.selectedTechniques.size).toEqual(0);
    }));

    it('should change tactic row color', inject([MatrixCommon], (service: MatrixCommon) => {
        service.viewModel = new ViewModel("layer","33","enterprise-attack-13",null);
        service.viewModel.showTacticRowBackground = true;
        service.tacticRowStyle;
        expect(service).toBeTruthy();
    }));

    it('should test techniqueVMs', inject([MatrixCommon], (service: MatrixCommon) => {
        let technique_list: Technique[] = [];
        let tactic_list: Tactic[] = [];
        let vm1 = service.viewModelsService.newViewModel("test1","enterprise-attack-13");
        let st1 = new Technique(subtechniqueSDO1,[],null);
        let t1 = new Technique(techniqueSDO,[st1],null);
        technique_list.push(t1);
        let tvm_1 = new TechniqueVM("T1595^reconnaissance");
        if (!tvm_1.modified()){
            tvm_1.metadata.length = 2;
            tvm_1.modified();
            tvm_1.resetAnnotations();
        }
        tvm_1.score = "3";
        let m1 = new Metadata();
        m1.name = "test1";
        m1.value = "t1";
        tvm_1.metadata.push(m1);
        let m2 = new Metadata();
        m2.divider = true;
        tvm_1.metadata.push(m2);
        let l1 = new Link();
        l1.label = "test1";
        l1.url = "t1";
        tvm_1.links.push(l1);
        tvm_1.serialize();
        vm1.layout.layout = "mini";
        vm1.layout.layout;
        vm1.layout.serialize();
		vm1.setTechniqueVM(tvm_1);
        let tactic1 = new Tactic(tacticSDO,technique_list,null);
        tactic_list.push(tactic1);
        expect(tactic_list.length).toEqual(1);
    }));
});