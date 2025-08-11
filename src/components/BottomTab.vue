<template>
  <div class="card">
    <Toolbar class="toolbar">
      <template #center>
        <div class="input-container">
          <FloatLabel variant="on">
            <InputText 
              id="in_label" 
              v-model="message" 
              variant="filled" 
              class="input-field"
              placeholder=""
              @keyup.enter="sendMessage"
            />
            <label for="in_label">Send message</label>
          </FloatLabel>
          
          <Button 
            icon="pi pi-image" 
            class="send-button"
            @click="triggerFileInput"
          />
          
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect"
            accept="image/*"
            style="display: none"
          >
          
          <Button 
            icon="pi pi-send" 
            class="send-button" 
            @click="sendMessage" 
          />
          
          <Button 
            icon="pi pi-cog" 
            class="send-button" 
            @click="toggleMenu" 
            aria-haspopup="true"
            aria-controls="options_menu" 
          />
          
          <Menu 
            id="options_menu" 
            ref="menu" 
            :model="items" 
            :popup="true" 
          />
        </div>
      </template>
    </Toolbar>
    <!-- Diálogo para cambiar nickname -->
    <Dialog 
      v-model:visible="nicknameDialogVisible"
      header="Cambiar Nickname" 
      :position="dialogPosition"
      :modal="true"
      :style="{ width: '350px' }"
    >
      <div class="p-fluid">
        <div class="field">
          <InputText 
            v-model="newNickname" 
            placeholder="Nuevo nickname" 
            autofocus
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="nicknameDialogVisible = false"
          class="p-button-text"
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="saveNickname"
          autofocus
        />
      </template>
    </Dialog>

    <!-- Diálogo para subir foto -->
    <Dialog 
      v-model:visible="uploadDialogVisible"
      header="Subir Foto" 
      :position="dialogPosition"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="upload-dialog-content">
        <div class="upload-area" @click="selectFile">
          <i class="pi pi-cloud-upload" style="font-size: 2rem"></i>
          <p>Arrastra tu foto aquí o haz clic para seleccionar</p>
          <input 
            type="file" 
            ref="fileInput" 
            @change="onFileChange" 
            accept="image/*"
            style="display: none"
          >
        </div>
        <div v-if="previewImage" class="image-preview">
          <img :src="previewImage" alt="Vista previa">
          <Button 
            icon="pi pi-trash" 
            class="p-button-rounded p-button-danger p-button-text remove-btn"
            @click="removeImage"
          />
        </div>
        <div class="file-info" v-if="selectedFile">
          <p><i class="pi pi-file"></i> {{ selectedFile.name }}</p>
          <p><i class="pi pi-info-circle"></i> {{ formatFileSize(selectedFile.size) }}</p>
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="closeUploadDialog"
          class="p-button-text"
        />
        <Button 
          label="Subir" 
          icon="pi pi-upload" 
          @click="uploadFile"
          :disabled="!selectedFile"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['send-message', 'send-image']);


// Estados para los diálogos
const nicknameDialogVisible = ref(false);
const uploadDialogVisible = ref(false);
const dialogPosition = ref('bottom');

// Estados para el nickname
const newNickname = ref('');
const message = ref('');

// Estados para la subida de archivos
const selectedFile = ref(null);
const previewImage = ref('');
const fileInput = ref(null);

const menu = ref();

const items = ref([
  {
    label: 'Cambiar Nickname',
    icon: 'pi pi-user',
    command: () => {
      nicknameDialogVisible.value = true;
      newNickname.value = '';
    }
  },
  {
    label: 'Subir Foto',
    icon: 'pi pi-file-import',
    command: () => {
      uploadDialogVisible.value = true;
      resetFileInput();
    }
  }
]);


const sendMessage = () => {
  if (message.value.trim()) {
    emit('send-message', message.value.trim());
    message.value = '';
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    emit('send-image', file);
    e.target.value = ''; // Reset input para permitir la misma imagen otra vez
  }
};

const toggleMenu = (event) => {
  menu.value.toggle(event);
};



const saveNickname = () => {
  if (newNickname.value.trim()) {
    alert(`Nickname cambiado a: ${newNickname.value}`);
    nicknameDialogVisible.value = false;
  } else {
    alert('Por favor ingresa un nickname válido');
  }
};

// Métodos para subir archivos
const selectFile = () => {
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
};

const removeImage = () => {
  selectedFile.value = null;
  previewImage.value = '';
};

const closeUploadDialog = () => {
  uploadDialogVisible.value = false;
  resetFileInput();
};

const resetFileInput = () => {
  selectedFile.value = null;
  previewImage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const uploadFile = () => {
  if (selectedFile.value) {
    // Aquí iría la lógica para subir el archivo
    alert(`Archivo listo para subir: ${selectedFile.value.name}`);
    uploadDialogVisible.value = false;
    resetFileInput();
  }
};
</script>

<style scoped>
.toolbar {
  width: 100%;
  padding: 0.5rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.input-field {
  flex: 1;
  min-width: 600px;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.send-button {
  padding: 0.50rem;
  border-radius: 6px;
}

/* Estilos para el diálogo de subida */
.upload-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 2px dashed var(--surface-border);
  border-radius: 6px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background-color: var(--surface-ground);
}

.image-preview {
  position: relative;
  margin-top: 1rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  display: block;
  margin: 0 auto;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.file-info {
  background-color: var(--surface-ground);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.file-info p {
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Media Queries para móviles */
@media (max-width: 768px) {
  .input-container {
    padding: 0 0.5rem;
  }

  .input-field {
    font-size: 0.9rem;
    padding: 0.5rem;
    min-width: 50px;
  }

  .send-button {
    padding: 0.5rem;
  }

  .upload-area {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .input-field {
    font-size: 0.8rem;
  }
  
  :deep(.p-dialog) {
    width: 95vw !important;
  }
}
</style>