<script setup>
import {
	PhArrowUp, PhForkKnife, PhLaptop, PhFilmSlate,
	PhCar, PhHouse, PhHeartbeat, PhDotsThree, PhPencilSimple,
} from '@phosphor-icons/vue'

const props = defineProps({
	widget: {
		type: Object,
		required: true,
	},
})


</script>

<template>


<div class="card">
    <header class="card-header">
        <p class="card-header-title"> Total Balance </p>
        <button class="card-header-icon" aria-label="more options">
            <span class="icon">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
        </button>
    </header>

    <div class="card-content">
        <div class="content">
            $67.67
        </div>
    </div>
</div>




</template>
<style scoped>

.card
{
    background : rgba(255, 255, 255, 0);

	border-bottom: 1px solid rgba(20, 6, 6, 0);
	/* transition: background 0.12s; */
}


</style>
