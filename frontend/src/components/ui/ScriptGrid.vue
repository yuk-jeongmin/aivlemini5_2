<template>
    <v-container>
        <v-snackbar
            v-model="snackbar.status"
            :timeout="snackbar.timeout"
            :color="snackbar.color"
        >
            
            <v-btn style="margin-left: 80px;" text @click="snackbar.status = false">
                Close
            </v-btn>
        </v-snackbar>
        <div class="panel">
            <div class="gs-bundle-of-buttons" style="max-height:10vh;">
                <v-btn @click="addNewRow" @class="contrast-primary-text" small color="primary">
                    <v-icon small style="margin-left: -5px;">mdi-plus</v-icon>등록
                </v-btn>
                <v-btn :disabled="!selectedRow" style="margin-left: 5px;" @click="openEditDialog()" class="contrast-primary-text" small color="primary">
                    <v-icon small>mdi-pencil</v-icon>수정
                </v-btn>
                <v-btn :disabled="!selectedRow || !hasRole('author')" style="margin-left: 5px;" @click="requestPublish" class="contrast-primary-text" small color="primary" >
                    <v-icon small>mdi-minus-circle-outline</v-icon>출간요청 
                </v-btn>
                <v-btn :disabled="!selectedRow || !hasRole('author')" style="margin-left: 5px;" @click="saveTemporaryScriptDialog = true" class="contrast-primary-text" small color="primary">
                    <v-icon small>mdi-minus-circle-outline</v-icon>원고임시저장
                </v-btn>
                <v-dialog v-model="saveTemporaryScriptDialog" width="500">
                    <SaveTemporaryScript
                        @closeDialog="saveTemporaryScriptDialog = false"
                        @saveTemporaryScript="saveTemporaryScript"
                    ></SaveTemporaryScript>
                </v-dialog>
            </div>
            <div class="mb-5 text-lg font-bold"></div>
            <div class="table-responsive">
                <v-table>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>AuthorId</th>
                        <th>AuthorName</th>
                        <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(val, idx) in value" 
                            @click="changeSelectedRow(val)"
                            :key="val"  
                            :style="val === selectedRow ? 'background-color: rgb(var(--v-theme-primary), 0.2) !important;':''"
                        >
                            <td class="font-semibold">{{ idx + 1 }}</td>
                            <td class="whitespace-nowrap" label="Title">{{ val.title }}</td>
                            <td class="whitespace-nowrap" label="Content">{{ val.content }}</td>
                            <td class="whitespace-nowrap" label="AuthorId">{{ val.authorId }}</td>
                            <td class="whitespace-nowrap" label="AuthorName">{{ val.authorName }}</td>
                            <td class="whitespace-nowrap" label="Status">{{ val.status }}</td>
                            <v-row class="ma-0 pa-4 align-center">
                                <v-spacer></v-spacer>
                                <Icon style="cursor: pointer;" icon="mi:delete" @click="deleteRow(val)" />
                            </v-row>
                        </tr>
                    </tbody>
                </v-table>
            </div>
        </div>
        <v-col>
            <v-dialog
                v-model="openDialog"
                transition="dialog-bottom-transition"
                width="35%"
            >
                <v-card>
                    <v-toolbar
                        color="primary"
                        class="elevation-0 pa-4"
                        height="50px"
                    >
                        <div style="color:white; font-size:17px; font-weight:700;">Script 등록</div>
                        <v-spacer></v-spacer>
                        <v-icon
                            color="white"
                            small
                            @click="closeDialog()"
                        >mdi-close</v-icon>
                    </v-toolbar>
                    <v-card-text>
                        <Script :offline="offline"
                            :isNew="!value.idx"
                            :editMode="true"
                            :inList="false"
                            v-model="newValue"
                            @add="append"
                        />
                    </v-card-text>
                </v-card>
            </v-dialog>
            <v-dialog
                v-model="editDialog"
                transition="dialog-bottom-transition"
                width="35%"
            >
                <v-card>
                    <v-toolbar
                        color="primary"
                        class="elevation-0 pa-4"
                        height="50px"
                    >
                        <div style="color:white; font-size:17px; font-weight:700;">Script 수정</div>
                        <v-spacer></v-spacer>
                        <v-icon
                            color="white"
                            small
                            @click="closeDialog()"
                        >mdi-close</v-icon>
                    </v-toolbar>
                    <v-card-text>
                        <div>
                            <String label="Title" v-model="selectedRow.title" :editMode="true"/>
                            <String label="Content" v-model="selectedRow.content" :editMode="true"/>
                            <Number label="AuthorId" v-model="selectedRow.authorId" :editMode="true"/>
                            <String label="AuthorName" v-model="selectedRow.authorName" :editMode="true"/>
                            <String label="NotifyStatus" v-model="selectedRow.notifyStatus" :editMode="true"/>
                            <v-divider class="border-opacity-100 my-divider"></v-divider>
                            <v-layout row justify-end>
                                <v-btn
                                    width="64px"
                                    color="primary"
                                    @click="save"
                                >
                                    수정
                                </v-btn>
                            </v-layout>
                        </div>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-col>
    </v-container>
</template>

<script>
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import BaseGrid from '../base-ui/BaseGrid.vue'


export default {
    name: 'scriptGrid',
    mixins:[BaseGrid],
    components:{
    },
    data: () => ({
        path: 'scripts',
        requestPublishDialog: false,
        saveTemporaryScriptDialog: false,
    }),
    watch: {
    },
    methods:{
        async requestPublish(params){
                if (
                !this.selectedRow ||
                !this.selectedRow._links ||
                !this.selectedRow._links.requestpublish
                ) {
                this.snackbar = {
                    status: true,
                    color: 'error',
                    timeout: 2000,
                    text: '출간 요청이 불가능합니다. (링크 없음)'
                }
                return
                }
                try{
                var path = "requestPublish".toLowerCase();
                var temp = await this.repository.invoke(this.selectedRow, path, params || {})
                for(var i = 0; i< this.value.length; i++){
                    if(this.value[i] == this.selectedRow){
                    this.value[i] = temp.data
                    }
                }
                this.snackbar = {
                    status: true,
                    color: 'success',
                    timeout: 2000,
                    text: '출간요청 성공'
                }
                }catch(e){
                    this.snackbar = {
                    status: true,
                    color: 'error',
                    timeout: 2000,
                    text: '출간요청 실패'
                    }
                    console.log(e)
                }
            },
        async saveTemporaryScript(params){
            try{
                var path = "saveTemporaryScript".toLowerCase();
                var temp = await this.repository.invoke(this.selectedRow, path, params)
                // 스넥바 관련 수정 필요
                // this.$EventBus.$emit('show-success','saveTemporaryScript 성공적으로 처리되었습니다.')
                for(var i = 0; i< this.value.length; i++){
                    if(this.value[i] == this.selectedRow){
                        this.value[i] = temp.data
                    }
                }
                this.saveTemporaryScriptDialog = false
            }catch(e){
                console.log(e)
            }
        },
    }
}

</script>