<script lang="ts">
    import Papa from 'papaparse';
    import {onMount} from 'svelte';

    interface Student {
        firstName: string;
        lastName: string;
        idNumber: string;
        grade: string;
    }

    let students: Student[] = [];
    let filteredStudents: Student[] = [];
    let searchQuery: string = '';
    let selectedStudent: Student | null = null;
    let svgTemplate: string | null = null;
    let renderedSvg: string | null = null;
    let idCardWrapper: HTMLElement | null = null;

    // Save data to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('svgTemplate', svgTemplate);
    }

    // Load data from localStorage
    function loadFromLocalStorage() {
        const storedStudents = localStorage.getItem('students');
        const storedSvgTemplate = localStorage.getItem('svgTemplate');

        if (storedStudents) {
            students = JSON.parse(storedStudents);
            filteredStudents = students;
            if (students.length > 0) {
                selectStudent(students[0]);
            }
        }

        if (storedSvgTemplate) {
            svgTemplate = storedSvgTemplate;
            updateRenderedSvg();
        }
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: function (results) {
                    if (results.data.length > 0) {
                        students = results.data;
                        filteredStudents = students;
                        selectStudent(students[0]);
                        saveToLocalStorage(); // Save to localStorage after uploading
                    }
                }
            });
        }
    }

    function handleSvgUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            svgTemplate = e.target.result as string;
            updateRenderedSvg();
            saveToLocalStorage(); // Save to localStorage after uploading
        };

        if (file) {
            reader.readAsText(file);
        }
    }

    function updateRenderedSvg() {
        if (svgTemplate && selectedStudent) {
            renderedSvg = svgTemplate
                .replace(/{{firstName}}/g, selectedStudent.firstName)
                .replace(/{{lastName}}/g, selectedStudent.lastName)
                .replace(/{{idNumber}}/g, selectedStudent.idNumber)
                .replace(/{{grade}}/g, selectedStudent.grade);
        }
    }

    function selectStudent(student: Student) {
        selectedStudent = student;
        updateRenderedSvg();
    }

    function clearData() {
        localStorage.removeItem('students');
        localStorage.removeItem('svgTemplate');
        students = [];
        filteredStudents = [];
        selectedStudent = null;
        svgTemplate = null;
        renderedSvg = null;
        if (idCardWrapper) {
            idCardWrapper.innerHTML = '';
        }
    }

    // Filter students based on the search query, including name and ID number
    $: filteredStudents = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: if (idCardWrapper && renderedSvg) {
        idCardWrapper.innerHTML = renderedSvg;
    }

    // Load data from localStorage on component mount
    onMount(() => {
        loadFromLocalStorage();
    });
</script>

<main>
    <div class="container my-5">
        <div class="row">
            <div class="col-md-4">
                <div class="mb-3">
                    <label for="csvUpload" class="form-label">Upload CSV File</label>
                    <input type="file" class="form-control" id="csvUpload" accept=".csv" on:change={handleFileUpload}>
                </div>
                <div class="mb-3">
                    <label for="svgUpload" class="form-label">Upload SVG Template</label>
                    <input type="file" class="form-control" id="svgUpload" accept=".svg" on:change={handleSvgUpload}>
                </div>
                <div class="mb-3">
                    <button class="btn btn-danger w-100" on:click={clearData}>Clear Data</button>
                </div>
                <div class="mb-3">
                    <label for="search" class="form-label">Search Students</label>
                    <input type="text" class="form-control" id="search" bind:value={searchQuery}
                           placeholder="Search by name or ID...">
                </div>
                <div class="student-list list-group">
                    {#each filteredStudents as student (student.idNumber)}
                        <div class="list-group-item list-group-item-action d-flex flex-column align-items-start"
                             on:click={() => selectStudent(student)} class:active={selectedStudent === student}>
                            <h5>{student.firstName} {student.lastName}</h5>
                            <span>Student ID: {student.idNumber}</span>
                            <span>Grade: {student.grade}</span>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="col-md-8 d-flex justify-content-center">
                {#if renderedSvg}
                    <div class="id-card-wrapper" bind:this={idCardWrapper}></div>
                {/if}
            </div>
        </div>
    </div>
</main>

<style lang="scss">
  .id-card-wrapper {
    width: 100%; /* Ensures the SVG scales properly */
    max-width: 428px; /* 428px wide for a CR-80 card scaled to 50% */
    height: 672px; /* Corresponding height for portrait CR-80 */
    border: 1px solid #000;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 15px; /* Added border radius */
    overflow: hidden; /* Ensures that the SVG content does not overflow the rounded corners */
  }

  .student-list {
    max-height: 60vh;
    overflow-y: auto;
  }

  .list-group-item-action {
    cursor: pointer;
  }
</style>
